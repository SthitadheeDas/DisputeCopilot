import { ApiError } from "../core/api-error.js";
import type { ApiPromise } from "../core/api-promise.js";
import type { RequestOptions } from "../core/api-request.js";
import { noneAuth } from "../core/auth/schemes.js";
import type { RawClient } from "../core/raw-client.js";
import { activityLogResponseSchema, type ActivityLogResponse } from "../models/activity-log-response.js";
import type { Servers } from "../servers.js";

/**
 * Chronological merchant action logging and audit trail
 */
export class Audit {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;

  constructor(rawClient: RawClient, servers: Servers) {
    this.#rawClient = rawClient;
    this.#servers = servers;
  }

  /**
   * Retrieve Merchant Audit Trail
   *
   * @remarks
   * Returns the chronological, immutable log of merchant actions, submitted evidence statements,
   * and settlement decisions.
   *
   * @returns Successfully retrieved audit log.
   *
   * @throws {@link ApiError} when the API answers with an error status
   *
   * @throws {@link DisputeCopilotApiError} when no usable response was produced: a connection
   * failure, a timeout, a body that would not decode, a value that would not encode, or a
   * credential that could not be obtained
   */
  getActivityLog(options?: RequestOptions): ApiPromise<ActivityLogResponse, ApiError> {
    return this.#rawClient.execute(
      {
        method: "GET",
        urlTemplate: this.#servers.default("/api/activity"),
        auth: noneAuth,
        pathParams: [],
        query: [],
        headers: [],
        body: { kind: "empty" },
      },
      {
        success: { kind: "json", schema: activityLogResponseSchema },
        errorFactory: ApiError,
      },
      options,
    );
  }
}
