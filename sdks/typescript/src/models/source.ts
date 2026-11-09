import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

export const Source = {
  Tracking: "tracking",
  Order: "order",
  RefundHistory: "refund_history",
  CustomerMessages: "customer_messages",
  PaypalDispute: "paypal_dispute",
} as const;
export type Source = (typeof Source)[keyof typeof Source] | (string & {});

export const sourceSchema: EnumSchema<Source> = s.enumOf<Source>(Source);
