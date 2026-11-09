import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { cachedAiAnalysisSchema, type CachedAiAnalysis } from "./cached-ai-analysis.js";

export type AnalyzeResponse = {
  success: boolean;
  disputeId: string;
  analysis: CachedAiAnalysis | null;
};

export const analyzeResponseSchema: Schema<AnalyzeResponse> = s.object<AnalyzeResponse>({
  success: s.boolean(),
  disputeId: s.string(),
  analysis: s.nullable(s.lazy(() => cachedAiAnalysisSchema)),
});
