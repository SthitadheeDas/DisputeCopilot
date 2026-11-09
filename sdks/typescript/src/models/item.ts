import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type Item = {
  name?: string;
  description?: string;
  price?: number;
};

export const itemSchema: Schema<Item> = s.object<Item>({
  name: s.optional(s.string()),
  description: s.optional(s.string()),
  price: s.optional(s.float64()),
});
