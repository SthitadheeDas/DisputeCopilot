import * as s from "../core/validation/index.js";
import type { EnumSchema } from "../core/validation/schema.js";

export const Recommendation = {
  Fight: "fight",
  Accept: "accept",
  PartialOffer: "partial_offer",
} as const;
export type Recommendation = (typeof Recommendation)[keyof typeof Recommendation] | (string & {});

export const recommendationSchema: EnumSchema<Recommendation> = s.enumOf<Recommendation>(Recommendation);
