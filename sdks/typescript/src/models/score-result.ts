import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { bandSchema, type Band } from "./band.js";
import { rubricItemResultSchema, type RubricItemResult } from "./rubric-item-result.js";

export type ScoreResult = {
  totalScore: number;
  band: Band;
  disputeReason: string;
  breakdown: RubricItemResult[];
  summary: string;
};

export const scoreResultSchema: Schema<ScoreResult> = s.object<ScoreResult>({
  totalScore: s.int(),
  band: bandSchema,
  disputeReason: s.string(),
  breakdown: s.array(s.lazy(() => rubricItemResultSchema)),
  summary: s.string(),
});
