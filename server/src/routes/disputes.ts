import { Router } from 'express';
import { z } from 'zod';
import { CONFIG } from '../config.js';
import { loadFixtureDisputes, findFixtureDisputeById } from '../store/fixtures.js';
import { findOrderByTransactionId } from '../store/store.js';
import { buildEvidencePack, scoreDispute } from '../scoring/index.js';
import { getCachedAnalysis } from '../store/cache.js';
import { getActivityLog, logActivity } from '../store/activity.js';
import { PayPalDispute } from '../types/dispute.js';

const router = Router();

// Helper to assemble dispute with order, evidence, score, and deadline calculations
function enrichDispute(dispute: PayPalDispute) {
  const txnId = dispute.disputed_transactions?.[0]?.seller_transaction_id || '';
  const order = findOrderByTransactionId(txnId);
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

// GET /api/disputes - list all disputes sorted by seller response deadline
router.get('/disputes', (_req, res) => {
  try {
    let disputes: PayPalDispute[] = [];

    if (CONFIG.dataMode === 'fixture') {
      disputes = loadFixtureDisputes();
    } else {
      // In sandbox mode (Phase 2), will call PayPal Sandbox API
      // For now, falls back gracefully to fixtures if not yet wired
      disputes = loadFixtureDisputes();
    }

    const enriched = disputes.map(enrichDispute);

    // Sort by response due date ascending (soonest deadline first)
    enriched.sort((a, b) => {
      const dateA = new Date(a.seller_response_due_date).getTime();
      const dateB = new Date(b.seller_response_due_date).getTime();
      return dateA - dateB;
    });

    res.json({
      dataMode: CONFIG.dataMode,
      dryRun: CONFIG.dryRun,
      total: enriched.length,
      disputes: enriched,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error fetching disputes:', err);
    res.status(500).json({ error: 'Failed to retrieve disputes', details: message });
  }
});

// GET /api/disputes/:id - get single dispute with full evidence, score and AI draft
router.get('/disputes/:id', (req, res) => {
  try {
    const { id } = req.params;
    let dispute: PayPalDispute | null = null;

    if (CONFIG.dataMode === 'fixture') {
      dispute = findFixtureDisputeById(id);
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

// Input validation schemas using zod
const submitEvidenceSchema = z.object({
  notes: z.string().min(5, 'Notes must be at least 5 characters long'),
});

const offerSchema = z.object({
  amount: z.number().positive('Offer amount must be a positive number'),
  note: z.string().optional(),
});

// POST /api/disputes/:id/submit-evidence
router.post('/disputes/:id/submit-evidence', (req, res) => {
  const { id } = req.params;
  const parsed = submitEvidenceSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request body',
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  const payload = {
    evidences: [
      {
        evidence_type: 'OTHER',
        notes: parsed.data.notes,
      },
    ],
  };

  const log = logActivity({
    disputeId: id,
    action: 'submit-evidence',
    status: 'success',
    dryRun: CONFIG.dryRun,
    payload,
    response: { message: CONFIG.dryRun ? 'Dry run: payload validated and logged' : 'Evidence submitted' },
  });

  res.json({
    success: true,
    dryRun: CONFIG.dryRun,
    disputeId: id,
    activityId: log.id,
    message: CONFIG.dryRun
      ? 'DRY_RUN mode enabled: Evidence payload previewed and logged without external submission.'
      : 'Evidence successfully submitted to PayPal.',
    submittedPayload: payload,
  });
});

// POST /api/disputes/:id/accept
router.post('/disputes/:id/accept', (req, res) => {
  const { id } = req.params;

  const payload = {
    note: req.body?.note || 'Merchant accepted customer claim.',
  };

  const log = logActivity({
    disputeId: id,
    action: 'accept',
    status: 'success',
    dryRun: CONFIG.dryRun,
    payload,
    response: { message: CONFIG.dryRun ? 'Dry run: accept claim validated' : 'Claim accepted' },
  });

  res.json({
    success: true,
    dryRun: CONFIG.dryRun,
    disputeId: id,
    activityId: log.id,
    message: CONFIG.dryRun
      ? 'DRY_RUN mode enabled: Accept action previewed and logged without external submission.'
      : 'Claim accepted.',
  });
});

// POST /api/disputes/:id/offer
router.post('/disputes/:id/offer', (req, res) => {
  const { id } = req.params;
  const parsed = offerSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: 'Invalid request body',
      issues: parsed.error.issues.map((i) => i.message),
    });
    return;
  }

  const payload = {
    offer_type: 'REFUND',
    offer_amount: {
      currency_code: 'USD',
      value: parsed.data.amount.toFixed(2),
    },
    note: parsed.data.note || 'Settlement offer proposed by merchant',
  };

  const log = logActivity({
    disputeId: id,
    action: 'offer',
    status: 'success',
    dryRun: CONFIG.dryRun,
    payload,
    response: { message: CONFIG.dryRun ? 'Dry run: offer validated' : 'Offer submitted' },
  });

  res.json({
    success: true,
    dryRun: CONFIG.dryRun,
    disputeId: id,
    activityId: log.id,
    message: CONFIG.dryRun
      ? 'DRY_RUN mode enabled: Settlement offer previewed and logged without external submission.'
      : 'Offer submitted to customer.',
    submittedPayload: payload,
  });
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
