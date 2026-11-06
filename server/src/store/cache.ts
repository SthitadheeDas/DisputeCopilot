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
