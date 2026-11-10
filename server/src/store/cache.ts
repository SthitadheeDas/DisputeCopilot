import fs from 'fs';
import { ANALYSIS_CACHE_FILE } from '../config.js';

export interface CachedAIAnalysis {
  disputeId: string;
  summary: string;
  recommendation: 'fight' | 'accept' | 'partial_offer';
  recommendedOfferAmount?: number;
  draftNotes: string;
  citedFactIds: string[];
  generatedAt: string;
  needsReview?: boolean;
  source?: 'gemini' | 'fallback';
}

export function getCachedAnalysis(disputeId: string): CachedAIAnalysis | null {
  try {
    if (!fs.existsSync(ANALYSIS_CACHE_FILE)) {
      return null;
    }
    const raw = fs.readFileSync(ANALYSIS_CACHE_FILE, 'utf-8');
    const cache = JSON.parse(raw) as Record<string, CachedAIAnalysis>;
    return cache[disputeId] || null;
  } catch (err) {
    console.error(`[Cache] Error reading analysis-cache.json:`, err);
    return null;
  }
}

export function setCachedAnalysis(analysis: CachedAIAnalysis): void {
  try {
    let cache: Record<string, CachedAIAnalysis> = {};
    if (fs.existsSync(ANALYSIS_CACHE_FILE)) {
      const raw = fs.readFileSync(ANALYSIS_CACHE_FILE, 'utf-8');
      cache = JSON.parse(raw);
    }
    cache[analysis.disputeId] = analysis;
    fs.writeFileSync(ANALYSIS_CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Cache] Error writing to analysis-cache.json:`, err);
  }
}

export function resetAnalysisCache(): void {
  try {
    const defaultAnalyses: Record<string, CachedAIAnalysis> = {
      'PP-D-1001': {
        disputeId: 'PP-D-1001',
        summary: 'Item Not Received claim assessed at 100/100 (STRONG defense strength). Recommended strategy: FIGHT.',
        recommendation: 'fight',
        draftNotes: 'Formal Merchant Defense Response for Dispute PP-D-1001 [F1] regarding MERCHANDISE_OR_SERVICE_NOT_RECEIVED [F2].\n\nThe order was fulfilled and shipped by the seller. Carrier tracking confirms shipment [F15] and successful delivery to the recipient address [F16]. Direct physical signature was captured upon delivery [F17]. The delivery address matches the buyer transaction details. We respectfully request this dispute be closed under Seller Protection.',
        citedFactIds: ['F1', 'F2', 'F15', 'F16', 'F17'],
        generatedAt: new Date().toISOString(),
        needsReview: false,
      },
      'PP-D-1002': {
        disputeId: 'PP-D-1002',
        summary: 'Item Not Received claim assessed at 100/100 (STRONG defense strength). Recommended strategy: FIGHT.',
        recommendation: 'fight',
        draftNotes: 'Formal Merchant Defense Response for Dispute PP-D-1002 [F1] regarding MERCHANDISE_OR_SERVICE_NOT_RECEIVED [F2].\n\nThe order was fulfilled and shipped by the seller. Carrier tracking confirms shipment [F15] and successful delivery to the recipient address [F16]. Direct physical signature was captured upon delivery [F17]. The delivery address matches the buyer transaction details. We respectfully request this dispute be closed under Seller Protection.',
        citedFactIds: ['F1', 'F2', 'F15', 'F16', 'F17'],
        generatedAt: new Date().toISOString(),
        needsReview: false,
      },
      'PP-D-1003': {
        disputeId: 'PP-D-1003',
        summary: 'Item Not Received claim with porch delivery without signature. Recommended strategy: FIGHT.',
        recommendation: 'fight',
        draftNotes: 'Formal Merchant Defense Response for Dispute PP-D-1003 [F1]. USPS tracking confirms delivered on porch [F16]. We request seller protection.',
        citedFactIds: ['F1', 'F2', 'F15', 'F16'],
        generatedAt: new Date().toISOString(),
        needsReview: false,
      },
      'PP-D-1004': {
        disputeId: 'PP-D-1004',
        summary: 'Untracked lettermail shipment lacking carrier scan. Score: 15/100. Recommended strategy: ACCEPT.',
        recommendation: 'accept',
        draftNotes: 'Merchant acknowledges standard untracked lettermail fulfillment without proof of delivery. Conceding claim.',
        citedFactIds: ['F1', 'F2'],
        generatedAt: new Date().toISOString(),
        needsReview: false,
      },
      'PP-D-1005': {
        disputeId: 'PP-D-1005',
        summary: 'Not As Described claim for vintage keyboard. Listing clearly disclosed cosmetic condition. Recommended strategy: FIGHT.',
        recommendation: 'fight',
        draftNotes: 'Item delivered matches listing description and photos exactly. Return policy offered.',
        citedFactIds: ['F1', 'F2', 'F18', 'F19'],
        generatedAt: new Date().toISOString(),
        needsReview: false,
      },
      'PP-D-1006': {
        disputeId: 'PP-D-1006',
        summary: 'Not As Described claim where $50 goodwill refund was already issued. Recommended strategy: PARTIAL_OFFER.',
        recommendation: 'partial_offer',
        recommendedOfferAmount: 50,
        draftNotes: 'Prior partial refund of $50 was already credited. Proposing settlement reflecting prior adjustment.',
        citedFactIds: ['F1', 'F2', 'F14'],
        generatedAt: new Date().toISOString(),
        needsReview: false,
      },
    };

    if (fs.existsSync(ANALYSIS_CACHE_FILE)) {
      fs.writeFileSync(ANALYSIS_CACHE_FILE, JSON.stringify(defaultAnalyses, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error(`[Cache] Error resetting analysis cache:`, err);
  }
}
