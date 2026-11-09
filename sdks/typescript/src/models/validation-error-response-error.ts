import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";

export type ValidationErrorResponseError = {
  error: string;
  issues: string[];
};

export const validationErrorResponseErrorSchema: Schema<ValidationErrorResponseError> =
  s.object<ValidationErrorResponseError>({
    error: s.string(),
    issues: s.array(s.string()),
  });
