import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type ValidationErrorResponse = {
  error: string;
  issues: string[];
};

export const validationErrorResponseSchema: Schema<ValidationErrorResponse> =
  s.object<ValidationErrorResponse>({
    error: s.string(),
    issues: s.array(s.string()),
  });
