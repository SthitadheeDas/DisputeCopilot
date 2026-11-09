import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { buyerSchema, type Buyer } from "./buyer.js";
import { moneySchema, type Money } from "./money.js";

export type DisputedTransaction = {
  sellerTransactionId: string;
  buyerTransactionId?: string;
  grossAmount?: Money;
  buyer?: Buyer;
  sellerProtectionEligible?: boolean;
};

export const disputedTransactionSchema: Schema<DisputedTransaction> = s.object<DisputedTransaction>({
  sellerTransactionId: s.string(),
  buyerTransactionId: s.optional(s.string()),
  grossAmount: s.optional(s.lazy(() => moneySchema)),
  buyer: s.optional(s.lazy(() => buyerSchema)),
  sellerProtectionEligible: s.optional(s.boolean()),
  _keysMap: {
    sellerTransactionId: "seller_transaction_id",
    buyerTransactionId: "buyer_transaction_id",
    grossAmount: "gross_amount",
    sellerProtectionEligible: "seller_protection_eligible",
  },
});
