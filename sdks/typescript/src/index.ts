export { DisputeCopilotApiClient } from "./client.js";
export type { ClientOptions } from "./client-options.js";

export { ServerEnvironment } from "./servers.js";

export { System } from "./resources/system.js";
export { Disputes } from "./resources/disputes.js";
export { Ai } from "./resources/ai.js";
export { Actions } from "./resources/actions.js";
export { Audit } from "./resources/audit.js";

export { acceptClaimRequestSchema, type AcceptClaimRequest } from "./models/accept-claim-request.js";
export { Action, actionSchema } from "./models/action.js";
export { actionResultResponseSchema, type ActionResultResponse } from "./models/action-result-response.js";
export { activityLogEntrySchema, type ActivityLogEntry } from "./models/activity-log-entry.js";
export { activityLogResponseSchema, type ActivityLogResponse } from "./models/activity-log-response.js";
export { analyzeResponseSchema, type AnalyzeResponse } from "./models/analyze-response.js";
export {
  apiDisputesResetResponseSchema,
  type ApiDisputesResetResponse,
} from "./models/api-disputes-reset-response.js";
export { Band, bandSchema } from "./models/band.js";
export { buyerSchema, type Buyer } from "./models/buyer.js";
export { cachedAiAnalysisSchema, type CachedAiAnalysis } from "./models/cached-ai-analysis.js";
export { DataMode, dataModeSchema } from "./models/data-mode.js";
export { disputedTransactionSchema, type DisputedTransaction } from "./models/disputed-transaction.js";
export { disputesListResponseSchema, type DisputesListResponse } from "./models/disputes-list-response.js";
export { enrichedDisputeSchema, type EnrichedDispute } from "./models/enriched-dispute.js";
export { errorResponseSchema, type ErrorResponse } from "./models/error-response.js";
export { errorResponseErrorSchema, type ErrorResponseError } from "./models/error-response-error.js";
export { evidenceFactSchema, type EvidenceFact } from "./models/evidence-fact.js";
export { evidencePackSchema, type EvidencePack } from "./models/evidence-pack.js";
export { healthResponseSchema, type HealthResponse } from "./models/health-response.js";
export { itemSchema, type Item } from "./models/item.js";
export { makeOfferRequestSchema, type MakeOfferRequest } from "./models/make-offer-request.js";
export { moneySchema, type Money } from "./models/money.js";
export { Recommendation, recommendationSchema } from "./models/recommendation.js";
export { rubricItemResultSchema, type RubricItemResult } from "./models/rubric-item-result.js";
export { scoreResultSchema, type ScoreResult } from "./models/score-result.js";
export { Source, sourceSchema } from "./models/source.js";
export { Status, statusSchema } from "./models/status.js";
export { storeOrderSchema, type StoreOrder } from "./models/store-order.js";
export { submitEvidenceRequestSchema, type SubmitEvidenceRequest } from "./models/submit-evidence-request.js";
export {
  validationErrorResponseSchema,
  type ValidationErrorResponse,
} from "./models/validation-error-response.js";
export {
  validationErrorResponseErrorSchema,
  type ValidationErrorResponseError,
} from "./models/validation-error-response-error.js";

export {
  CoreError as DisputeCopilotApiError,
  ResponseError,
  DecodeError,
  EncodeError,
  ConnectionError,
  TimeoutError,
  AuthError,
  PaginationError,
  ConfigurationError,
} from "./core/errors.js";
export { ApiError } from "./core/api-error.js";
export { SchemaError } from "./core/validation/schema-error.js";
export {
  defaultLoggingOptions,
  type LoggingOptions,
  type RequestLoggingOptions,
  type Logger,
  type LogDetails,
  type HttpRequestDetails,
  type RequestHeadersDetails,
  type RequestBodyDetails,
  type HttpResponseDetails,
  type ResponseHeadersDetails,
  type HttpRetryingDetails,
  type HttpFailedDetails,
  type LogLevel,
} from "./core/logging.js";
export type { ApiPromise, ApiResult } from "./core/api-promise.js";
export type { Pageable, PageableApiResult } from "./core/pagination/pageable.js";
export type { HttpMethod, RequestOptions } from "./core/api-request.js";
export type { RetryOptions, RequestRetryOptions, RetryAttempt, RetryReason } from "./core/retry.js";
export type { BinaryContent, BinaryData, BinaryErrorContent, FileData, FileInput } from "./core/binary.js";
export type { ErrorKind } from "./core/errors.js";
export type { Declared, Undeclared } from "./core/api-error.js";
export type { Schema, EnumSchema, Encoded } from "./core/validation/schema.js";
