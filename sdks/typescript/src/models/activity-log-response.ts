import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { activityLogEntrySchema, type ActivityLogEntry } from "./activity-log-entry.js";

export type ActivityLogResponse = {
  total: number;
  activity: ActivityLogEntry[];
};

export const activityLogResponseSchema: Schema<ActivityLogResponse> = s.object<ActivityLogResponse>({
  total: s.int(),
  activity: s.array(s.lazy(() => activityLogEntrySchema)),
});
