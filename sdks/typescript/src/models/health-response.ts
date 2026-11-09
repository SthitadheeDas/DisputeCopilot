import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { dataModeSchema, type DataMode } from "./data-mode.js";

export type HealthResponse = {
  status: string;
  dataMode: DataMode;
  dryRun: boolean;
  geminiModel?: string;
  hasPayPalCredentials?: boolean;
  hasGeminiKey?: boolean;
  ordersCount: number;
  disputesCount: number;
  timestamp: Date;
};

export const healthResponseSchema: Schema<HealthResponse> = s.object<HealthResponse>({
  status: s.string(),
  dataMode: dataModeSchema,
  dryRun: s.boolean(),
  geminiModel: s.optional(s.string()),
  hasPayPalCredentials: s.optional(s.boolean()),
  hasGeminiKey: s.optional(s.boolean()),
  ordersCount: s.int(),
  disputesCount: s.int(),
  timestamp: s.dateTime(),
});
