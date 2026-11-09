import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { itemSchema, type Item } from "./item.js";

export type StoreOrder = {
  orderId?: string;
  paypalTransactionId?: string;
  customerName?: string;
  items?: Item[];
  amount?: number;
  currency?: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  listingDescription?: string;
  returnPolicyText?: string;
};

export const storeOrderSchema: Schema<StoreOrder> = s.object<StoreOrder>({
  orderId: s.optional(s.string()),
  paypalTransactionId: s.optional(s.string()),
  customerName: s.optional(s.string()),
  items: s.optional(s.array(s.lazy(() => itemSchema))),
  amount: s.optional(s.float64()),
  currency: s.optional(s.string()),
  carrier: s.optionalNullable(s.string()),
  trackingNumber: s.optionalNullable(s.string()),
  listingDescription: s.optional(s.string()),
  returnPolicyText: s.optional(s.string()),
});
