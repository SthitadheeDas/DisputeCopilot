import Groq from 'groq-sdk';
import { CONFIG } from '../config.js';
import { EvidencePack, PayPalDispute, ScoreResult } from '../types/dispute.js';
import { AIAnalysisOutput, buildPrompt, validateCitations } from './gemini.js';

export interface GroqGenerationResult {
  analysis: AIAnalysisOutput;
  modelUsed: string;
}

/**
 * Attempts to generate a grounded dispute analysis using Groq.
 * Primary model: CONFIG.groq.model or 'openai/gpt-oss-120b'.
 * If the configured model is unavailable/not found on Groq, tries fallback models
 * ('llama-3.3-70b-versatile', 'llama-3.1-8b-instant').
 */
export async function generateGroqAnalysis(
  dispute: PayPalDispute,
  evidencePack: EvidencePack,
  scoreResult: ScoreResult,
  timeoutMs = 15000
): Promise<GroqGenerationResult> {
  if (!CONFIG.groq.apiKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const groq = new Groq({ apiKey: CONFIG.groq.apiKey });

  const primaryModel = CONFIG.groq.model || 'openai/gpt-oss-120b';
  const fallbackCandidates = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
  const candidateModels = [
    primaryModel,
    ...fallbackCandidates.filter((m) => m !== primaryModel),
  ];

  let lastErr: unknown;

  for (const model of candidateModels) {
    try {
      const executeCall = async (promptText: string): Promise<AIAnalysisOutput> => {
        let timer: NodeJS.Timeout;
        const timeoutPromise = new Promise<never>((_, reject) => {
          timer = setTimeout(
            () => reject(new Error(`Groq API call (${model}) timed out after ${timeoutMs}ms`)),
            timeoutMs
          );
        });

        const apiPromise = (async () => {
          const completion = await groq.chat.completions.create({
            messages: [
              {
                role: 'system',
                content:
                  'You are Dispute Copilot, an AI assistant representing a small merchant in PayPal payment disputes. You must respond with valid JSON matching the requested schema with keys: summary, recommendation (one of "fight", "accept", "partial_offer"), recommendedOfferAmount (number, optional), draftNotes (string citing facts like [F1]), and citedFactIds (array of string IDs cited).',
              },
              {
                role: 'user',
                content: promptText,
              },
            ],
            model,
            response_format: { type: 'json_object' },
            temperature: 0.1,
          });

          const content = completion.choices[0]?.message?.content || '{}';
          const parsed = JSON.parse(content) as AIAnalysisOutput;
          if (!parsed.summary || !parsed.recommendation || !parsed.draftNotes) {
            throw new Error('Groq response missing required fields');
          }
          if (!Array.isArray(parsed.citedFactIds)) {
            parsed.citedFactIds = [];
          }
          return parsed;
        })();

        try {
          return await Promise.race([apiPromise, timeoutPromise]);
        } finally {
          clearTimeout(timer!);
        }
      };

      // 1. Initial generation attempt
      let rawResult = await executeCall(buildPrompt(dispute, evidencePack, scoreResult));
      let citationCheck = validateCitations(rawResult.citedFactIds || [], evidencePack);

      // 2. If citations invalid, retry once with corrective feedback
      if (!citationCheck.valid) {
        console.warn(
          `[Groq] Invalid citation fact IDs detected (${citationCheck.invalidIds.join(', ')}). Retrying once with corrective instruction.`
        );
        const correction = `PREVIOUS OUTPUT ERROR: You cited fact IDs [${citationCheck.invalidIds.join(', ')}] which DO NOT exist in the Evidence Pack. You may ONLY cite valid IDs from: ${evidencePack.facts.map((f) => f.id).join(', ')}.`;
        rawResult = await executeCall(
          buildPrompt(dispute, evidencePack, scoreResult, correction)
        );
        citationCheck = validateCitations(rawResult.citedFactIds || [], evidencePack);
      }

      // Filter citedFactIds to only valid IDs
      const validSet = new Set(evidencePack.facts.map((f) => f.id));
      rawResult.citedFactIds = (rawResult.citedFactIds || []).filter((id) => validSet.has(id));
      rawResult.needsReview = !citationCheck.valid;
      rawResult.source = 'groq';

      return {
        analysis: rawResult,
        modelUsed: model,
      };
    } catch (err: unknown) {
      lastErr = err;
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[Groq] Attempt with model '${model}' failed: ${msg}`);

      // If it looks like a model not found / model de-listed error, try next candidate
      const isModelNotFoundError =
        msg.includes('model_not_found') ||
        msg.includes('does not exist') ||
        msg.includes('not found') ||
        msg.includes('404') ||
        msg.includes('invalid_request_error');

      if (isModelNotFoundError && candidateModels.indexOf(model) < candidateModels.length - 1) {
        console.warn(`[Groq] Trying alternate model...`);
        continue;
      }

      // Otherwise break to allow fallback to Gemini
      break;
    }
  }

  throw lastErr;
}
