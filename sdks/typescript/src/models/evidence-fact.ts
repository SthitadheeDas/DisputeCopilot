import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { sourceSchema, type Source } from "./source.js";

export type EvidenceFact = {
  id: string;
  label: string;
  value: string;
  source: Source;
};

export const evidenceFactSchema: Schema<EvidenceFact> = s.object<EvidenceFact>({
  id: s.string(),
  label: s.string(),
  value: s.string(),
  source: sourceSchema,
});
