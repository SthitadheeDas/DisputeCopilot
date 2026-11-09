import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type SubmitEvidenceRequest = {
  /** Formal merchant statement and factual defense notes. */
  notes: string;
};

export const submitEvidenceRequestSchema: Schema<SubmitEvidenceRequest> = s.object<SubmitEvidenceRequest>({
  notes: s.string(),
});
