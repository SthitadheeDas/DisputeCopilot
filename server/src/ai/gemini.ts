import { GoogleGenAI, Type } from '@google/genai';
import { CONFIG } from '../config.js';
import {
  EvidencePack,
  PayPalDispute,
  ScoreResult,
} from '../types/dispute.js';
import { CachedAIAnalysis, getCachedAnalysis, setCachedAnalysis } from '../store/cache.js';
import { generateGroqAnalysis } from './groq.js';

export interface AIAnalysisOutput {
  summary: string;
  recommendation: 'fight' | 'accept' | 'partial_offer';
  recommendedOfferAmount?: number;
  draftNotes: string;
  citedFactIds: string[];
  needsReview?: boolean;
  source?: 'groq' | 'gemini' | 'fallback';
}

/**
 * Validates that all fact IDs cited by the model exist in the evidence pack.
 */
export function validateCitations(
  citedFactIds: string[],
  evidencePack: EvidencePack
): { valid: boolean; invalidIds: string[] } {
  const allowedFactIds = new Set(evidencePack.facts.map((f) => f.id));
  const invalidIds = citedFactIds.filter((id) => !allowedFactIds.has(id));
  return {
    valid: invalidIds.length === 0,
    invalidIds,
  };
}

/**
 * Builds the strict, grounded system and user prompt for Gemini / Groq.
 */
export function buildPrompt(
  dispute: PayPalDispute,
  evidencePack: EvidencePack,
  scoreResult: ScoreResult,
  correctionNote?: string
): string {
  const factsList = evidencePack.facts
    .map((f) => `[${f.id}] (${f.source.toUpperCase()}) ${f.label}: ${f.value}`)
    .join('\n');

  const missingList =
    evidencePack.missingItems.length > 0
      ? evidencePack.missingItems.map((m) => `- ${m}`).join('\n')
      : 'None';

  const breakdownList = scoreResult.breakdown
    .map((b) => `- ${b.title}: ${b.passed ? 'PASSED' : 'FAILED'} (${b.pointsAwarded}/${b.pointsPossible} pts) - ${b.reason}`)
    .join('\n');

  return `You are Dispute Copilot, an AI assistant representing a small merchant in PayPal payment disputes.
Your task is to analyze the case, recommend a strategy, and draft a formal, persuasive response to PayPal.

STRICT FACTUAL GROUNDING RULES:
1. You must use ONLY the facts listed in the Evidence Pack below.
2. NEVER invent dates, names, tracking numbers, carriers, or events not present in the Evidence Pack.
3. Every factual claim in your draftNotes must reference its fact ID in brackets, like [F1], [F2].
4. Do NOT claim anything that is listed as missing or absent.
5. In 'citedFactIds', output an array containing ONLY the valid IDs of facts you cited (e.g. ["F1", "F2"]).
6. Recommend 'fight' if score >= 70 (strong evidence). Recommend 'partial_offer' if score is 40-69 (medium evidence). Recommend 'accept' if score < 40 (weak evidence, e.g. untracked).
7. If recommending 'partial_offer', suggest a fair recommendedOfferAmount based on dispute amount.

DISPUTE DETAILS:
- Dispute ID: ${dispute.dispute_id}
- Dispute Reason: ${dispute.reason}
- Disputed Amount: ${dispute.dispute_amount.currency_code} ${dispute.dispute_amount.value}
- Response Deadline: ${dispute.seller_response_due_date}

DETERMINISTIC WINNABILITY SCORE:
- Total Score: ${scoreResult.totalScore}/100 (Band: ${scoreResult.band.toUpperCase()})
- Rubric Breakdown:
${breakdownList}

EVIDENCE PACK FACTS:
${factsList}

MISSING EVIDENCE ITEMS:
${missingList}
${correctionNote ? `\nCORRECTION INSTRUCTION:\n${correctionNote}` : ''}
Provide your output as structured JSON matching the requested schema.`;
}

/**
 * Calls Gemini 3.8 Flash with 503 retry handling and citation self-correction.
 */
async function callGeminiModel(
  dispute: PayPalDispute,
  evidencePack: EvidencePack,
  scoreResult: ScoreResult
): Promise<CachedAIAnalysis> {
  const disputeId = dispute.dispute_id;
  if (!CONFIG.gemini.apiKey) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey: CONFIG.gemini.apiKey });
  const configuredModel = CONFIG.gemini.model || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const modelName = configuredModel;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: 'Concise 2-3 sentence overview of case strength and reason.',
      },
      recommendation: {
        type: Type.STRING,
        enum: ['fight', 'accept', 'partial_offer'],
        description: 'Recommended defense action: fight, accept, or partial_offer.',
      },
      recommendedOfferAmount: {
        type: Type.NUMBER,
        description: 'Suggested refund amount if recommendation is partial_offer.',
      },
      draftNotes: {
        type: Type.STRING,
        description:
          'Persuasive, formal statement to PayPal citing facts by their ID like [F1], [F2].',
      },
      citedFactIds: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'Array of exact fact IDs cited in draftNotes, e.g. ["F1", "F2"].',
      },
    },
    required: ['summary', 'recommendation', 'draftNotes', 'citedFactIds'],
  };

  const callModelWithTimeout = async (prompt: string, timeoutMs = 15000): Promise<AIAnalysisOutput> => {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Gemini API call timed out after ${timeoutMs}ms`)), timeoutMs);
    });

    const apiPromise = (async () => {
      let lastErr: unknown;
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              temperature: 0.1,
              responseMimeType: 'application/json',
              responseSchema,
            },
          });
          const text = response.text || '{}';
          return JSON.parse(text) as AIAnalysisOutput;
        } catch (err: unknown) {
          lastErr = err;
          const errMsg = err instanceof Error ? err.message : String(err);
          const is503 =
            errMsg.includes('503') ||
            errMsg.toUpperCase().includes('UNAVAILABLE') ||
            (typeof err === 'object' &&
              err !== null &&
              (('status' in err && (err as { status: unknown }).status === 503) ||
                ('code' in err && (err as { code: unknown }).code === 503)));

          if (attempt === 1 && is503) {
            console.warn(
              `[Gemini] Model ${modelName} returned 503 UNAVAILABLE on attempt 1. Pausing 2000ms before retry...`
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
            continue;
          }
          throw err;
        }
      }
      throw lastErr;
    })();

    try {
      const res = await Promise.race([apiPromise, timeoutPromise]);
      return res;
    } finally {
      clearTimeout(timer!);
    }
  };

  // First generation attempt
  let rawResult = await callModelWithTimeout(buildPrompt(dispute, evidencePack, scoreResult));
  let citationCheck = validateCitations(rawResult.citedFactIds || [], evidencePack);

  // If citations invalid, retry once with explicit corrective feedback
  if (!citationCheck.valid) {
    console.warn(
      `[Gemini] Invalid citation fact IDs detected (${citationCheck.invalidIds.join(', ')}). Retrying once with corrective instruction.`
    );
    const correction = `PREVIOUS OUTPUT ERROR: You cited fact IDs [${citationCheck.invalidIds.join(', ')}] which DO NOT exist in the Evidence Pack. You may ONLY cite valid IDs from: ${evidencePack.facts.map((f) => f.id).join(', ')}.`;
    rawResult = await callModelWithTimeout(
      buildPrompt(dispute, evidencePack, scoreResult, correction)
    );
    citationCheck = validateCitations(rawResult.citedFactIds || [], evidencePack);
  }

  const needsReview = !citationCheck.valid;
  const validSet = new Set(evidencePack.facts.map((f) => f.id));
  const safeCitedIds = (rawResult.citedFactIds || []).filter((id) => validSet.has(id));

  return {
    disputeId,
    summary: rawResult.summary,
    recommendation: rawResult.recommendation,
    recommendedOfferAmount: rawResult.recommendedOfferAmount,
    draftNotes: rawResult.draftNotes,
    citedFactIds: safeCitedIds,
    generatedAt: new Date().toISOString(),
    needsReview,
    source: 'gemini',
    model: modelName,
  };
}

/**
 * 3-Tier AI Dispute Defense Pipeline:
 * 1. Primary: Groq (openai/gpt-oss-120b or llama-3.3-70b-versatile)
 * 2. Secondary Fallback: Gemini 3.8 Flash (with 503 retry)
 * 3. Final Fallback: Grounded Rule Engine
 */
export async function analyzeDisputeWithGroq(
  dispute: PayPalDispute,
  evidencePack: EvidencePack,
  scoreResult: ScoreResult,
  forceRefresh = false
): Promise<CachedAIAnalysis> {
  const disputeId = dispute.dispute_id;

  // 1. Check local cache first unless force refresh requested
  if (!forceRefresh) {
    const cached = getCachedAnalysis(disputeId);
    if (cached) {
      return cached;
    }
  }

  // Primary & Exclusive AI Provider: Groq API
  if (CONFIG.groq.apiKey) {
    try {
      const groqResult = await generateGroqAnalysis(dispute, evidencePack, scoreResult);
      const analysis: CachedAIAnalysis = {
        disputeId,
        summary: groqResult.analysis.summary,
        recommendation: groqResult.analysis.recommendation,
        recommendedOfferAmount: groqResult.analysis.recommendedOfferAmount,
        draftNotes: groqResult.analysis.draftNotes,
        citedFactIds: groqResult.analysis.citedFactIds,
        generatedAt: new Date().toISOString(),
        needsReview: groqResult.analysis.needsReview ?? false,
        source: 'groq',
        model: groqResult.modelUsed,
      };
      setCachedAnalysis(analysis);
      return analysis;
    } catch (groqErr: unknown) {
      const msg = groqErr instanceof Error ? groqErr.message : String(groqErr);
      console.warn(`[AI Pipeline] Groq API call failed (${msg}). Falling back to Grounded Rule Engine...`);
    }
  }

  // Offline Safety Net: Grounded Rule Engine
  console.warn(`[AI Pipeline] Using Grounded Rule Engine for dispute ${disputeId}.`);
  const fallback = generateFallbackAnalysis(dispute, evidencePack, scoreResult);
  fallback.needsReview = true;
  fallback.source = 'fallback';
  setCachedAnalysis(fallback);
  return fallback;
}

export const analyzeDisputeWithAI = analyzeDisputeWithGroq;
export const analyzeDisputeWithGemini = analyzeDisputeWithGroq;

/**
 * Grounded fallback generator when Groq & Gemini are offline, timed out, or rate limited.
 */
export function generateFallbackAnalysis(
  dispute: PayPalDispute,
  evidencePack: EvidencePack,
  scoreResult: ScoreResult
): CachedAIAnalysis {
  const disputeId = dispute.dispute_id;
  const facts = evidencePack.facts;

  const fDispute = facts.find((f) => f.label === 'Dispute ID');
  const fReason = facts.find((f) => f.label === 'Dispute Reason');
  const fTracking = facts.find((f) => f.label.includes('Tracking'));
  const fDelivery = facts.find((f) => f.label.includes('Delivery Status'));
  const fSig = facts.find((f) => f.label.includes('Signature'));
  const fDesc = facts.find((f) => f.label.includes('Listing Description'));
  const fPolicy = facts.find((f) => f.label.includes('Return Policy'));

  const citedIds: string[] = [];
  if (fDispute) citedIds.push(fDispute.id);
  if (fReason) citedIds.push(fReason.id);

  let recommendation: 'fight' | 'accept' | 'partial_offer' = 'fight';
  let recommendedOfferAmount: number | undefined = undefined;

  if (scoreResult.totalScore >= 70) {
    recommendation = 'fight';
  } else if (scoreResult.totalScore >= 40) {
    recommendation = 'partial_offer';
    recommendedOfferAmount = parseFloat(
      (parseFloat(dispute.dispute_amount.value) * 0.4).toFixed(2)
    );
  } else {
    recommendation = 'accept';
  }

  let draftNotes = `Formal Merchant Defense Response for Dispute ${dispute.dispute_id}`;
  if (fDispute) draftNotes += ` [${fDispute.id}]`;
  draftNotes += ` regarding ${dispute.reason}`;
  if (fReason) draftNotes += ` [${fReason.id}]`;
  draftNotes += `.\n\n`;

  if (dispute.reason.includes('NOT_RECEIVED') || dispute.reason.includes('INR')) {
    if (fTracking && fDelivery) {
      draftNotes += `The order was fulfilled and shipped by the seller. Carrier tracking confirms shipment [${fTracking.id}] and successful delivery to the recipient address [${fDelivery.id}]. `;
      citedIds.push(fTracking.id, fDelivery.id);
      if (fSig) {
        draftNotes += `Direct physical signature was captured upon delivery [${fSig.id}]. `;
        citedIds.push(fSig.id);
      }
      draftNotes += `The delivery address matches the buyer transaction details. We respectfully request this dispute be closed under Seller Protection.`;
    } else {
      draftNotes += `The merchant processed the customer order. Due to lack of formal carrier tracking confirmation, we are providing available transaction records for review.`;
    }
  } else {
    if (fDesc) {
      draftNotes += `The delivered merchandise matches all product listing specifications and disclosures [${fDesc.id}]. `;
      citedIds.push(fDesc.id);
    }
    if (fPolicy) {
      draftNotes += `Our clear return policy was presented to the customer prior to order completion [${fPolicy.id}]. `;
      citedIds.push(fPolicy.id);
    }
    draftNotes += `We stand by the authenticity and description of our goods.`;
  }

  return {
    disputeId,
    summary: `${scoreResult.summary} Recommended strategy: ${recommendation.toUpperCase()}.`,
    recommendation,
    recommendedOfferAmount,
    draftNotes,
    citedFactIds: Array.from(new Set(citedIds)),
    generatedAt: new Date().toISOString(),
    needsReview: true,
    source: 'fallback',
  };
}
