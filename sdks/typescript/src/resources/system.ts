import { ApiError } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import { healthResponseSchema, type HealthResponse } from "../models/health-response.js";
import type { Servers } from "../servers.js";

/**
 * Health and configuration monitoring endpoints
 */
export class System {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Health & Configuration Status
   *
   * @remarks
   * Returns service operational status, active data mode (sandbox vs fixture), dry run safety flag,
   * and order/dispute statistics.
   *
   * @returns Service is healthy and configured.
   *
   * @throws {@link ApiError} when the API answers with an error status
   *
   * @throws {@link DisputeCopilotApiError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  getHealth(options?: RequestOptions): ApiPromise<HealthResponse, ApiError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/health"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: healthResponseSchema },
        errorFactory: ApiError,
      },
      options,
    );
  }
}
