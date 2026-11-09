import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import {
  apiDisputesResetResponseSchema,
  type ApiDisputesResetResponse,
} from "../models/api-disputes-reset-response.js";
import { disputesListResponseSchema, type DisputesListResponse } from "../models/disputes-list-response.js";
import { enrichedDisputeSchema, type EnrichedDispute } from "../models/enriched-dispute.js";
import { errorResponseSchema, type ErrorResponse } from "../models/error-response.js";
import type { Servers } from "../servers.js";

/**
 * PayPal dispute retrieval, evidence pack compilation, and scoring
 */
export class Disputes {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Get Single Dispute Details
   *
   * @remarks
   * Fetches full details for a specific dispute, including its store order match, evidence pack
   * facts, score breakdown, and cached AI analysis.
   *
   * @returns Dispute details found and returned.
   *
   * @throws {@link Disputes.GetDisputeByIdError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link DisputeCopilotApiError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  getDisputeById(
    request: Disputes.GetDisputeByIdRequest,
    options?: RequestOptions,
  ): ApiPromise<EnrichedDispute, Disputes.GetDisputeByIdError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/disputes/{id}"),
        auth: noneAuth,
        pathParams: [{ name: "id", value: request.id, schema: s.string() }],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: enrichedDisputeSchema },
        errorFactory: Disputes.GetDisputeByIdError,
      },
      options,
    );
  }

  /**
   * List All Disputes
   *
   * @remarks
   * Retrieves all active PayPal customer disputes enriched with matched store order data, indexed
   * Evidence Packs, deterministic winnability scores, and live deadline calculations. Results are
   * sorted ascending by response deadline.
   *
   * @returns Successfully retrieved list of enriched disputes.
   *
   * @throws {@link Disputes.ListDisputesError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link DisputeCopilotApiError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  listDisputes(options?: RequestOptions): ApiPromise<DisputesListResponse, Disputes.ListDisputesError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/disputes"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: disputesListResponseSchema },
        errorFactory: Disputes.ListDisputesError,
      },
      options,
    );
  }

  /**
   * Reset Demo Dispute Database
   *
   * @remarks
   * Resets mock fixture disputes back to their initial active state (6 active disputes, clearing
   * test concessions/refunds).
   *
   * @returns Mock dispute database successfully reset.
   *
   * @throws {@link Disputes.ResetDisputesDemoError} when the API answers with an error status —
   * narrow on `err.payload.kind`
   *
   * @throws {@link DisputeCopilotApiError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  resetDisputesDemo(
    options?: RequestOptions,
  ): ApiPromise<ApiDisputesResetResponse, Disputes.ResetDisputesDemoError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/disputes/reset"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: apiDisputesResetResponseSchema },
        errorFactory: Disputes.ResetDisputesDemoError,
      },
      options,
    );
  }
}

export namespace Disputes {
  export type GetDisputeByIdRequest = {
    /** Unique PayPal dispute identifier (e.g. PP-D-1001). */
    id: string;
  };

  export class GetDisputeByIdError extends ApiError {
    declare readonly payload:
      | Declared<"errorResponse", ErrorResponse>
      | Declared<"errorResponse2", ErrorResponse>
      | Undeclared;

    static readonly errors: ErrorDecoders<GetDisputeByIdError> = [
      { on: 404, kind: "errorResponse", decode: { kind: "json", schema: errorResponseSchema } },
      { on: 500, kind: "errorResponse2", decode: { kind: "json", schema: errorResponseSchema } },
    ];
  }

  export class ListDisputesError extends ApiError {
    declare readonly payload: Declared<"errorResponse", ErrorResponse> | Undeclared;

    static readonly errors: ErrorDecoders<ListDisputesError> = [
      { on: 500, kind: "errorResponse", decode: { kind: "json", schema: errorResponseSchema } },
    ];
  }

  export class ResetDisputesDemoError extends ApiError {
    declare readonly payload: Declared<"errorResponse", ErrorResponse> | Undeclared;

    static readonly errors: ErrorDecoders<ResetDisputesDemoError> = [
      { on: 500, kind: "errorResponse", decode: { kind: "json", schema: errorResponseSchema } },
    ];
  }
}
