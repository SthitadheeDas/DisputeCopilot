import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { dataModeSchema, type DataMode } from "./data-mode.js";
import { enrichedDisputeSchema, type EnrichedDispute } from "./enriched-dispute.js";

export type DisputesListResponse = {
  dataMode: DataMode;
  configuredMode?: string;
  dryRun: boolean;
  total: number;
  warning?: string | null;
  disputes: EnrichedDispute[];
};

export const disputesListResponseSchema: Schema<DisputesListResponse> = s.object<DisputesListResponse>({
  dataMode: dataModeSchema,
  configuredMode: s.optional(s.string()),
  dryRun: s.boolean(),
  total: s.int(),
  warning: s.optionalNullable(s.string()),
  disputes: s.array(s.lazy(() => enrichedDisputeSchema)),
});
