import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type ActionResultResponse = {
  success: boolean;
  dryRun: boolean;
  disputeId: string;
  activityId?: string;
  message: string;
  submittedPayload?: Record<string, unknown>;
};

export const actionResultResponseSchema: Schema<ActionResultResponse> = s.object<ActionResultResponse>({
  success: s.boolean(),
  dryRun: s.boolean(),
  disputeId: s.string(),
  activityId: s.optional(s.string()),
  message: s.string(),
  submittedPayload: s.optional(s.record(s.string(), s.unknown())),
});
