import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { analyzeResponseSchema, type AnalyzeResponse } from "../models/analyze-response.js";
import { errorResponseSchema, type ErrorResponse } from "../models/error-response.js";
import type { Servers } from "../servers.js";

/**
 * Grounded defense drafting and citation analysis via Gemini
 */
export class Ai {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Generate or Refresh Gemini AI Defense Analysis
   *
   * @remarks
   * Invokes Google Gemini to evaluate the dispute and Evidence Pack. Produces structured JSON
   * containing strategic recommendation (FIGHT / ACCEPT / PARTIAL_OFFER), summary, and a factual
   * draft defense strictly citing Evidence Pack fact IDs ([F1], [F2]). Validates all citations
   * against the Evidence Pack and caches the output locally.
   *
   * @returns AI analysis successfully generated and verified.
   *
   * @throws {@link Ai.AnalyzeDisputeError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link DisputeCopilotApiError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  analyzeDispute(
    request: Ai.AnalyzeDisputeRequest,
    options?: RequestOptions,
  ): ApiPromise<AnalyzeResponse, Ai.AnalyzeDisputeError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/disputes/{id}/analyze"),
        auth: noneAuth,
        pathParams: [{ name: "id", value: request.id, schema: s.string() }],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: analyzeResponseSchema },
        errorFactory: Ai.AnalyzeDisputeError,
      },
      options,
    );
  }
}

export namespace Ai {
  export type AnalyzeDisputeRequest = {
    /** Unique PayPal dispute identifier. */
    id: string;
  };

  export class AnalyzeDisputeError extends ApiError {
    declare readonly payload:
      | Declared<"errorResponse", ErrorResponse>
      | Declared<"errorResponse2", ErrorResponse>
      | Undeclared;

    static readonly errors: ErrorDecoders<AnalyzeDisputeError> = [
      { on: 404, kind: "errorResponse", decode: { kind: "json", schema: errorResponseSchema } },
      { on: 500, kind: "errorResponse2", decode: { kind: "json", schema: errorResponseSchema } },
    ];
  }
}
