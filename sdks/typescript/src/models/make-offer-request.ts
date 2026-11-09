import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type MakeOfferRequest = {
  /** Partial refund settlement amount in USD. */
  amount: number;
  /** Optional note to the customer describing the settlement proposal. */
  note?: string;
};

export const makeOfferRequestSchema: Schema<MakeOfferRequest> = s.object<MakeOfferRequest>({
  amount: s.float64(),
  note: s.optional(s.string()),
});
