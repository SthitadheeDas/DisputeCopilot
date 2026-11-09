import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type AcceptClaimRequest = {
  /** Optional explanation for accepting claim and issuing full refund. */
  note?: string;
};

export const acceptClaimRequestSchema: Schema<AcceptClaimRequest> = s.object<AcceptClaimRequest>({
  note: s.optional(s.string()),
});
