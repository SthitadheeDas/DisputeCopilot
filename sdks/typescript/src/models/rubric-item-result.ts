import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type RubricItemResult = {
  id: string;
  title: string;
  pointsPossible: number;
  pointsAwarded: number;
  passed: boolean;
  reason: string;
};

export const rubricItemResultSchema: Schema<RubricItemResult> = s.object<RubricItemResult>({
  id: s.string(),
  title: s.string(),
  pointsPossible: s.int(),
  pointsAwarded: s.int(),
  passed: s.boolean(),
  reason: s.string(),
});
