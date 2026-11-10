import { describe, it, expect, beforeEach } from 'vitest';
import { analyzeDisputeWithGemini } from '../gemini.js';
import { getCachedAnalysis, setCachedAnalysis } from '../../store/cache.js';
import { EvidencePack, PayPalDispute, ScoreResult } from '../../types/dispute.js';

describe('AI Citation & Analysis Verification', () => {
  const sampleDispute: PayPalDispute = {
    dispute_id: 'PP-D-AI-TEST-1',
    create_time: '2026-11-01T10:00:00Z',
    update_time: '2026-11-01T10:00:00Z',
    dispute_amount: { currency_code: 'USD', value: '349.99' },
    status: 'WAITING_FOR_SELLER_RESPONSE',
    dispute_state: 'REQUIRED_ACTION',
    dispute_lifecycle_stage: 'INQUIRY',
    reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    seller_response_due_date: '2026-11-10T10:00:00Z',
    disputed_transactions: [
      { seller_transaction_id: 'TXN-AI-1', gross_amount: { currency_code: 'USD', value: '349.99' } },
    ],
  };

  const sampleEvidencePack: EvidencePack = {
    facts: [
      { id: 'F1', label: 'Dispute ID', value: 'PP-D-AI-TEST-1', source: 'paypal_dispute' },
      { id: 'F2', label: 'Dispute Reason', value: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED', source: 'paypal_dispute' },
      { id: 'F3', label: 'Tracking Number', value: 'UPS: 1Z9999999999999991', source: 'tracking' },
      { id: 'F4', label: 'Delivery Status', value: 'DELIVERED on Oct 27', source: 'tracking' },
      { id: 'F5', label: 'Proof of Delivery Signature', value: 'Signed by: S. Jenkins', source: 'tracking' },
    ],
    missingItems: [],
  };

  const sampleScore: ScoreResult = {
    totalScore: 100,
    band: 'strong',
    disputeReason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    breakdown: [
      { id: 'INR_TRACKING_EXISTS', title: 'Tracking Provided', pointsPossible: 20, pointsAwarded: 20, passed: true, reason: 'UPS tracking' },
      { id: 'INR_STATUS_DELIVERED', title: 'Delivered', pointsPossible: 30, pointsAwarded: 30, passed: true, reason: 'Delivered' },
      { id: 'INR_DELIVERED_BEFORE_DISPUTE', title: 'Delivered Before Dispute', pointsPossible: 10, pointsAwarded: 10, passed: true, reason: 'Delivered Oct 27' },
      { id: 'INR_SIGNATURE_ON_DELIVERY', title: 'Signature on Delivery', pointsPossible: 15, pointsAwarded: 15, passed: true, reason: 'Signed' },
      { id: 'INR_ADDRESS_MATCHES', title: 'Address Matches', pointsPossible: 15, pointsAwarded: 15, passed: true, reason: 'Matches' },
      { id: 'INR_NO_PRE_DELIVERY_COMPLAINT', title: 'No Pre-delivery Complaint', pointsPossible: 5, pointsAwarded: 5, passed: true, reason: 'None' },
      { id: 'INR_NO_PRIOR_REFUND', title: 'No Prior Refund', pointsPossible: 5, pointsAwarded: 5, passed: true, reason: 'None' },
    ],
    summary: 'Strong defense: All fulfillment and signature criteria verified.',
  };

  it('generates a grounded fallback analysis with strict citations when offline or testing', async () => {
    const analysis = await analyzeDisputeWithGemini(sampleDispute, sampleEvidencePack, sampleScore, true);

    expect(analysis.disputeId).toBe('PP-D-AI-TEST-1');
    expect(analysis.recommendation).toBe('fight');
    expect(analysis.citedFactIds.length).toBeGreaterThan(0);
    expect(analysis.source).toBe('fallback');
    expect(analysis.needsReview).toBe(true);

    // Verify all cited fact IDs actually exist in the evidence pack
    const allowedIds = new Set(sampleEvidencePack.facts.map((f) => f.id));
    for (const citedId of analysis.citedFactIds) {
      expect(allowedIds.has(citedId)).toBe(true);
    }
  });

  it('persists and retrieves from analysis cache correctly', () => {
    const testAnalysis = {
      disputeId: 'PP-D-CACHE-TEST',
      summary: 'Cached analysis summary',
      recommendation: 'fight' as const,
      draftNotes: 'Evidence notes citing [F1]',
      citedFactIds: ['F1'],
      generatedAt: new Date().toISOString(),
      needsReview: false,
    };

    setCachedAnalysis(testAnalysis);
    const retrieved = getCachedAnalysis('PP-D-CACHE-TEST');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.disputeId).toBe('PP-D-CACHE-TEST');
    expect(retrieved?.summary).toBe('Cached analysis summary');
  });

  it('recommends accept when evidence score is weak', async () => {
    const weakScore: ScoreResult = {
      ...sampleScore,
      totalScore: 20,
      band: 'weak',
      summary: 'Weak defense: Untracked shipment',
    };

    const weakDispute: PayPalDispute = {
      ...sampleDispute,
      dispute_id: 'PP-D-WEAK-TEST',
    };

    const analysis = await analyzeDisputeWithGemini(weakDispute, sampleEvidencePack, weakScore, true);
    expect(analysis.recommendation).toBe('accept');
  });

  it('recommends partial_offer when evidence score is medium', async () => {
    const mediumScore: ScoreResult = {
      ...sampleScore,
      totalScore: 55,
      band: 'medium',
      summary: 'Medium defense: Delivered without signature',
    };

    const mediumDispute: PayPalDispute = {
      ...sampleDispute,
      dispute_id: 'PP-D-MED-TEST',
    };

    const analysis = await analyzeDisputeWithGemini(mediumDispute, sampleEvidencePack, mediumScore, true);
    expect(analysis.recommendation).toBe('partial_offer');
    expect(analysis.recommendedOfferAmount).toBeGreaterThan(0);
  });
});
