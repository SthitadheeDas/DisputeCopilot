import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type ApiDisputesResetResponse = {
  success?: boolean;
  message?: string;
  total?: number;
};

export const apiDisputesResetResponseSchema: Schema<ApiDisputesResetResponse> =
  s.object<ApiDisputesResetResponse>({
    success: s.optional(s.boolean()),
    message: s.optional(s.string()),
    total: s.optional(s.int()),
  });
