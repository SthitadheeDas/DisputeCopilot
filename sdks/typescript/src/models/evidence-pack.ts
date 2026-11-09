import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { evidenceFactSchema, type EvidenceFact } from "./evidence-fact.js";

export type EvidencePack = {
  facts: EvidenceFact[];
  missingItems: string[];
};

export const evidencePackSchema: Schema<EvidencePack> = s.object<EvidencePack>({
  facts: s.array(s.lazy(() => evidenceFactSchema)),
  missingItems: s.array(s.string()),
});
