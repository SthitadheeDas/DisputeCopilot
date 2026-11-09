import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { recommendationSchema, type Recommendation } from "./recommendation.js";

export type CachedAiAnalysis = {
  disputeId: string;
  summary: string;
  recommendation: Recommendation;
  recommendedOfferAmount?: number | null;
  draftNotes: string;
  citedFactIds: string[];
  generatedAt: Date;
  needsReview?: boolean;
};

export const cachedAiAnalysisSchema: Schema<CachedAiAnalysis> = s.object<CachedAiAnalysis>({
  disputeId: s.string(),
  summary: s.string(),
  recommendation: recommendationSchema,
  recommendedOfferAmount: s.optionalNullable(s.float64()),
  draftNotes: s.string(),
  citedFactIds: s.array(s.string()),
  generatedAt: s.dateTime(),
  needsReview: s.optional(s.boolean()),
});
