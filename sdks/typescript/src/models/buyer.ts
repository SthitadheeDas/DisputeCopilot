import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type Buyer = {
  name?: string;
};

export const buyerSchema: Schema<Buyer> = s.object<Buyer>({
  name: s.optional(s.string()),
});
