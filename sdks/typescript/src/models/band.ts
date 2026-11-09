import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

export const Band = {
  Strong: "strong",
  Medium: "medium",
  Weak: "weak",
} as const;
export type Band = (typeof Band)[keyof typeof Band] | (string & {});

export const bandSchema: EnumSchema<Band> = s.enumOf<Band>(Band);
