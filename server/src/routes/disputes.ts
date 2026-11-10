import { Router } from 'express';
import { z } from 'zod';
import { CONFIG } from '../config.js';
import { loadFixtureDisputes, findFixtureDisputeById, updateFixtureDispute, resetFixtureDisputes } from '../store/fixtures.js';
import { findOrderByTransactionId, loadStoreOrders, addOrderRefund, resetStoreOrderRefunds } from '../store/store.js';
import { buildEvidencePack, scoreDispute } from '../scoring/index.js';
import { getCachedAnalysis, setCachedAnalysis, resetAnalysisCache } from '../store/cache.js';
import { getActivityLog, logActivity } from '../store/activity.js';
import {
  fetchLiveDisputes,
  fetchLiveDisputeDetails,
  submitPayPalEvidence,
  acceptPayPalClaim,
  makePayPalOffer,
} from '../paypal/index.js';
import { analyzeDisputeWithGemini } from '../ai/index.js';
import { PayPalDispute, StoreOrder } from '../types/dispute.js';

const router = Router();

// Helper to assemble dispute with order, evidence, score, and deadline calculations
function enrichDispute(dispute: PayPalDispute) {
  const txnId = dispute.disputed_transactions?.[0]?.seller_transaction_id || '';
  let order: StoreOrder | null = findOrderByTransactionId(txnId);

  // Secondary match: if txnId is placeholder or unmatched, require simultaneous customerName AND amount match.
  // Do NOT allow matching on amount alone.
  if (!order) {
    const buyerName = dispute.disputed_transactions?.[0]?.buyer?.name;
    const amountVal = parseFloat(dispute.dispute_amount?.value || '0');
    const allOrders = loadStoreOrders();

    if (buyerName && amountVal > 0) {
      order =
        allOrders.find(
          (o) =>
            o.customerName.toLowerCase() === buyerName.toLowerCase() &&
            Math.abs(o.amount - amountVal) < 0.01
        ) || null;
    }
  }

  const evidencePack = buildEvidencePack(dispute, order);
  const score = scoreDispute(dispute, order);

  const dueDate = new Date(dispute.seller_response_due_date).getTime();
  const now = Date.now();
  const hoursRemaining = Math.max(0, Math.round((dueDate - now) / (1000 * 60 * 60)));
  const cachedAnalysis = getCachedAnalysis(dispute.dispute_id);

  return {
    ...dispute,
    matchedOrder: order,
    evidencePack,
    score,
    hoursRemaining,
    cachedAnalysis,
  };
}

// GET /api/disputes - list disputes sorted by deadline
router.get('/disputes', async (_req, res) => {
  try {
    let disputes: PayPalDispute[] = [];
    let dataSourceUsed: 'sandbox' | 'fixture' = CONFIG.dataMode;
    let liveError: string | null = null;

    if (CONFIG.dataMode === 'sandbox') {
      try {
        disputes = await fetchLiveDisputes();
        if (disputes.length === 0) {
          // If sandbox has 0 disputes, provide fixtures as backup
          console.log('[PayPal] Live sandbox has 0 active disputes. Augmenting with fixture disputes.');
          disputes = loadFixtureDisputes();
        }
      } catch (err: unknown) {
        liveError = err instanceof Error ? err.message : 'Failed to reach PayPal Sandbox';
        console.warn(`[PayPal] Live fetch failed (${liveError}). Falling back to fixtures.`);
        disputes = loadFixtureDisputes();
        dataSourceUsed = 'fixture';
      }
    } else {
      disputes = loadFixtureDisputes();
    }

    const enriched = disputes.map(enrichDispute);

    // Sort by seller response due date ascending (closest deadline first)
    enriched.sort((a, b) => {
      const dateA = new Date(a.seller_response_due_date).getTime();
      const dateB = new Date(b.seller_response_due_date).getTime();
      return dateA - dateB;
    });

    res.json({
      dataMode: dataSourceUsed,
      configuredMode: CONFIG.dataMode,
      dryRun: CONFIG.dryRun,
      total: enriched.length,
      warning: liveError,
      disputes: enriched,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching disputes:', err);
    res.status(500).json({ error: 'Failed to retrieve disputes', details: message });
  }
});

// POST /api/disputes/reset - Reset demo dispute database back to default 6 active disputes
router.post('/disputes/reset', async (_req, res) => {
  try {
    const restored = resetFixtureDisputes();
    resetStoreOrderRefunds();
    resetAnalysisCache();

    res.json({
      success: true,
      message: 'Demo disputes and store data have been reset to active state.',
      total: restored.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Reset failed';
    console.error('Error resetting disputes demo data:', err);
    res.status(500).json({ error: 'Failed to reset demo data', details: message });
  }
});

// GET /api/disputes/:id - get single dispute details
router.get('/disputes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let dispute: PayPalDispute | null = null;

    if (CONFIG.dataMode === 'sandbox') {
      try {
        dispute = await fetchLiveDisputeDetails(id);
      } catch (err) {
        console.warn(`[PayPal] Could not fetch live dispute ${id}, trying fixtures:`, err);
        dispute = findFixtureDisputeById(id);
      }
    } else {
      dispute = findFixtureDisputeById(id);
    }

    if (!dispute) {
      res.status(404).json({ error: `Dispute with ID ${id} not found` });
      return;
    }

    const enriched = enrichDispute(dispute);
    res.json(enriched);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Error fetching dispute ${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to retrieve dispute details', details: message });
  }
});

// POST /api/disputes/:id/analyze - run or refresh Gemini AI analysis
router.post('/disputes/:id/analyze', async (req, res) => {
  try {
    const { id } = req.params;
    let dispute: PayPalDispute | null = null;

    if (CONFIG.dataMode === 'sandbox') {
      try {
        dispute = await fetchLiveDisputeDetails(id);
      } catch {
        dispute = findFixtureDisputeById(id);
      }
    } else {
      dispute = findFixtureDisputeById(id);
    }

    if (!dispute) {
      res.status(404).json({ error: `Dispute with ID ${id} not found` });
      return;
    }

    const enriched = enrichDispute(dispute);
    const analysis = await analyzeDisputeWithGemini(
      dispute,
      enriched.evidencePack,
      enriched.score,
      true // force refresh
    );

    res.json({
      success: true,
      disputeId: id,
      analysis,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Error analyzing dispute ${req.params.id} with Gemini:`, err);
    res.status(500).json({ error: 'Failed to generate AI analysis', details: message });
  }
});

// Zod schemas for merchant actions
const submitEvidenceSchema = z.object({
  notes: z.string().min(5, 'Notes must be at least 5 characters long'),
});

const offerSchema = z.object({
  amount: z.number().positive('Offer amount must be a positive number'),
  note: z.string().optional(),
});

// POST /api/disputes/:id/submit-evidence
router.post('/disputes/:id/submit-evidence', async (req, res) => {
  const { id } = req.params;
  const parsed = submitEvidenceSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request body',
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  try {
    const result = await submitPayPalEvidence(id, parsed.data.notes);

    // Update in-memory & file mock state to resolved/defended
    updateFixtureDispute(id, {
      status: 'RESOLVED_DEFENDED',
      dispute_state: 'RESOLVED',
      dispute_lifecycle_stage: 'RESOLVED',
    });

    const cached = getCachedAnalysis(id);
    setCachedAnalysis({
      disputeId: id,
      summary: cached?.summary || 'Merchant submitted formal defense with grounded evidence.',
      recommendation: 'fight',
      draftNotes: parsed.data.notes,
      citedFactIds: cached?.citedFactIds || ['F1', 'F2', 'F3'],
      generatedAt: new Date().toISOString(),
      needsReview: false,
    });

    const log = logActivity({
      disputeId: id,
      action: 'submit-evidence',
      status: result.success ? 'success' : 'failed',
      dryRun: result.dryRun,
      payload: result.submittedPayload,
      response: result.response,
    });

    res.json({
      success: result.success,
      dryRun: result.dryRun,
      disputeId: id,
      activityId: log.id,
      message: result.message,
      submittedPayload: result.submittedPayload,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Evidence submission failed';
    logActivity({
      disputeId: id,
      action: 'submit-evidence',
      status: 'failed',
      dryRun: CONFIG.dryRun,
      error: message,
    });
    res.status(500).json({ error: 'Evidence submission failed', details: message });
  }
});

// POST /api/disputes/:id/accept
router.post('/disputes/:id/accept', async (req, res) => {
  const { id } = req.params;
  const note = req.body?.note || 'Merchant accepted customer claim.';

  try {
    const result = await acceptPayPalClaim(id, note);

    // Update in-memory & file mock state to resolved/conceded
    updateFixtureDispute(id, {
      status: 'RESOLVED_ACCEPTED',
      dispute_state: 'RESOLVED',
      dispute_lifecycle_stage: 'RESOLVED',
    });

    // Update cached analysis recommendation to 'accept'
    const cached = getCachedAnalysis(id);
    setCachedAnalysis({
      disputeId: id,
      summary: 'Merchant accepted customer claim and conceded liability.',
      recommendation: 'accept',
      draftNotes: note,
      citedFactIds: cached?.citedFactIds || ['F1'],
      generatedAt: new Date().toISOString(),
      needsReview: false,
    });

    // Record refund on matched order in store.json if linked
    const dispute = findFixtureDisputeById(id);
    const txnId = dispute?.disputed_transactions?.[0]?.seller_transaction_id;
    const amountVal = parseFloat(dispute?.dispute_amount?.value || '0');
    if (txnId && amountVal > 0) {
      addOrderRefund(txnId, amountVal, 'Full refund conceded via PayPal Dispute claim acceptance');
    }

    const log = logActivity({
      disputeId: id,
      action: 'accept',
      status: result.success ? 'success' : 'failed',
      dryRun: result.dryRun,
      payload: result.submittedPayload,
      response: result.response,
    });

    res.json({
      success: result.success,
      dryRun: result.dryRun,
      disputeId: id,
      activityId: log.id,
      message: result.message,
      submittedPayload: result.submittedPayload,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Accept claim failed';
    logActivity({
      disputeId: id,
      action: 'accept',
      status: 'failed',
      dryRun: CONFIG.dryRun,
      error: message,
    });
    res.status(500).json({ error: 'Accept claim failed', details: message });
  }
});

// POST /api/disputes/:id/offer
router.post('/disputes/:id/offer', async (req, res) => {
  const { id } = req.params;
  const parsed = offerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request body',
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  try {
    const result = await makePayPalOffer(id, parsed.data.amount, parsed.data.note);

    // Update in-memory & file mock state to resolved/settled
    updateFixtureDispute(id, {
      status: 'RESOLVED',
      dispute_state: 'RESOLVED',
      dispute_lifecycle_stage: 'RESOLVED',
    });

    // Update cached analysis recommendation to 'partial_offer'
    const cached = getCachedAnalysis(id);
    setCachedAnalysis({
      disputeId: id,
      summary: `Merchant offered settlement refund of $${parsed.data.amount.toFixed(2)}.`,
      recommendation: 'partial_offer',
      recommendedOfferAmount: parsed.data.amount,
      draftNotes: parsed.data.note || `Settlement offer of $${parsed.data.amount.toFixed(2)} submitted.`,
      citedFactIds: cached?.citedFactIds || ['F1', 'F2'],
      generatedAt: new Date().toISOString(),
      needsReview: false,
    });

    // Record partial refund on matched order in store.json if linked
    const dispute = findFixtureDisputeById(id);
    const txnId = dispute?.disputed_transactions?.[0]?.seller_transaction_id;
    if (txnId && parsed.data.amount > 0) {
      addOrderRefund(txnId, parsed.data.amount, 'Partial settlement refund offered to buyer');
    }

    const log = logActivity({
      disputeId: id,
      action: 'offer',
      status: result.success ? 'success' : 'failed',
      dryRun: result.dryRun,
      payload: result.submittedPayload,
      response: result.response,
    });

    res.json({
      success: result.success,
      dryRun: result.dryRun,
      disputeId: id,
      activityId: log.id,
      message: result.message,
      submittedPayload: result.submittedPayload,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Offer submission failed';
    logActivity({
      disputeId: id,
      action: 'offer',
      status: 'failed',
      dryRun: CONFIG.dryRun,
      error: message,
    });
    res.status(500).json({ error: 'Offer submission failed', details: message });
  }
});

// GET /api/activity
router.get('/activity', (_req, res) => {
  try {
    const logs = getActivityLog();
    res.json({
      total: logs.length,
      activity: logs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to retrieve activity log', details: message });
  }
});

export default router;
