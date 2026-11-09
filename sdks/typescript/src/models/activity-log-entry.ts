import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { actionSchema, type Action } from "./action.js";
import { statusSchema, type Status } from "./status.js";

export type ActivityLogEntry = {
  id: string;
  timestamp: Date;
  disputeId: string;
  action: Action;
  status: Status;
  dryRun: boolean;
  payload?: Record<string, unknown>;
  response?: Record<string, unknown>;
  error?: string;
};

export const activityLogEntrySchema: Schema<ActivityLogEntry> = s.object<ActivityLogEntry>({
  id: s.string(),
  timestamp: s.dateTime(),
  disputeId: s.string(),
  action: actionSchema,
  status: statusSchema,
  dryRun: s.boolean(),
  payload: s.optional(s.record(s.string(), s.unknown())),
  response: s.optional(s.record(s.string(), s.unknown())),
  error: s.optional(s.string()),
});
