import { ApiError, type Declared, type Undeclared } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import type { ErrorDecoders } from "../core/response-decoder.js";
import { uuid } from "../core/uuid.js";
import * as s from "../core/validation/index.js";
import { acceptClaimRequestSchema, type AcceptClaimRequest } from "../models/accept-claim-request.js";
import { actionResultResponseSchema, type ActionResultResponse } from "../models/action-result-response.js";
import { errorResponseSchema, type ErrorResponse } from "../models/error-response.js";
import { makeOfferRequestSchema, type MakeOfferRequest } from "../models/make-offer-request.js";
import {
  submitEvidenceRequestSchema,
  type SubmitEvidenceRequest,
} from "../models/submit-evidence-request.js";
import {
  validationErrorResponseSchema,
  type ValidationErrorResponse,
} from "../models/validation-error-response.js";
import type { Servers } from "../servers.js";

/**
 * Merchant-approved PayPal dispute actions (evidence submission, claim acceptance, settlement
 * offers)
 */
export class Actions {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Accept Dispute Claim
   *
   * @remarks
   * Concedes liability and accepts the customer claim via PayPal Disputes API v1 (`POST
   * /v1/customer/disputes/{id}/accept-claim`). Authorizes full refund to buyer. If `DRY_RUN=true`,
   * validates and records action without sending network mutation.
   *
   * @returns Claim accepted or validated under DRY_RUN.
   *
   * @throws {@link Actions.AcceptClaimError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link DisputeCopilotApiError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  acceptClaim(
    request: Actions.AcceptClaimRequestParams,
    options?: RequestOptions,
  ): ApiPromise<ActionResultResponse, Actions.AcceptClaimError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/disputes/{id}/accept"),
        auth: noneAuth,
        pathParams: [{ name: "id", value: request.id, schema: s.string() }],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: {
          kind: "json",
          value: request.body,
          schema: s.optional(s.lazy(() => acceptClaimRequestSchema)),
        },
      },
      {
        success: { kind: "json", schema: actionResultResponseSchema },
        errorFactory: Actions.AcceptClaimError,
      },
      options,
    );
  }

  /**
   * Propose Partial Settlement Offer
   *
   * @remarks
   * Submits a partial refund settlement offer to the buyer via PayPal Disputes API v1 (`POST
   * /v1/customer/disputes/{id}/make-offer`). If `DRY_RUN=true`, validates offer amount and records
   * action in audit trail without live mutation.
   *
   * @returns Offer submitted or validated under DRY_RUN.
   *
   * @throws {@link Actions.MakeOfferError} when the API answers with an error status — narrow on
   * `err.payload.kind`
   *
   * @throws {@link DisputeCopilotApiError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  makeOffer(
    request: Actions.MakeOfferRequestParams,
    options?: RequestOptions,
  ): ApiPromise<ActionResultResponse, Actions.MakeOfferError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/disputes/{id}/offer"),
        auth: noneAuth,
        pathParams: [{ name: "id", value: request.id, schema: s.string() }],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: makeOfferRequestSchema },
      },
      {
        success: { kind: "json", schema: actionResultResponseSchema },
        errorFactory: Actions.MakeOfferError,
      },
      options,
    );
  }

  /**
   * Submit Evidence to PayPal
   *
   * @remarks
   * Submits merchant evidence statement to PayPal Disputes API v1 (`POST
   * /v1/customer/disputes/{id}/provide-evidence`). If `DRY_RUN=true`, validates and logs the
   * payload in the audit trail without modifying live account state.
   *
   * @returns Evidence submitted or safely validated under DRY_RUN.
   *
   * @throws {@link Actions.SubmitEvidenceError} when the API answers with an error status — narrow
   * on `err.payload.kind`
   *
   * @throws {@link DisputeCopilotApiError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  submitEvidence(
    request: Actions.SubmitEvidenceRequestParams,
    options?: RequestOptions,
  ): ApiPromise<ActionResultResponse, Actions.SubmitEvidenceError> {
    return this.#rawClient.execute(
      {
        method: "POST",
        urlTemplate: this.#servers.default("/api/disputes/{id}/submit-evidence"),
        auth: noneAuth,
        pathParams: [{ name: "id", value: request.id, schema: s.string() }],
        query: [],
        headers: [{ name: "Idempotency-Key", value: uuid(), schema: s.string() }],
        body: { kind: "json", value: request.body, schema: submitEvidenceRequestSchema },
      },
      {
        success: { kind: "json", schema: actionResultResponseSchema },
        errorFactory: Actions.SubmitEvidenceError,
      },
      options,
    );
  }
}

export namespace Actions {
  export type AcceptClaimRequestParams = {
    /** Unique PayPal dispute identifier. */
    id: string;
    body?: AcceptClaimRequest;
  };

  export class AcceptClaimError extends ApiError {
    declare readonly payload: Declared<"errorResponse", ErrorResponse> | Undeclared;

    static readonly errors: ErrorDecoders<AcceptClaimError> = [
      { on: 500, kind: "errorResponse", decode: { kind: "json", schema: errorResponseSchema } },
    ];
  }

  export type MakeOfferRequestParams = {
    /** Unique PayPal dispute identifier. */
    id: string;
    body: MakeOfferRequest;
  };

  export class MakeOfferError extends ApiError {
    declare readonly payload:
      | Declared<"validationErrorResponse", ValidationErrorResponse>
      | Declared<"errorResponse", ErrorResponse>
      | Undeclared;

    static readonly errors: ErrorDecoders<MakeOfferError> = [
      {
        on: 400,
        kind: "validationErrorResponse",
        decode: { kind: "json", schema: validationErrorResponseSchema },
      },
      { on: 500, kind: "errorResponse", decode: { kind: "json", schema: errorResponseSchema } },
    ];
  }

  export type SubmitEvidenceRequestParams = {
    /** Unique PayPal dispute identifier. */
    id: string;
    body: SubmitEvidenceRequest;
  };

  export class SubmitEvidenceError extends ApiError {
    declare readonly payload:
      | Declared<"validationErrorResponse", ValidationErrorResponse>
      | Declared<"errorResponse", ErrorResponse>
      | Undeclared;

    static readonly errors: ErrorDecoders<SubmitEvidenceError> = [
      {
        on: 400,
        kind: "validationErrorResponse",
        decode: { kind: "json", schema: validationErrorResponseSchema },
      },
      { on: 500, kind: "errorResponse", decode: { kind: "json", schema: errorResponseSchema } },
    ];
  }
}
