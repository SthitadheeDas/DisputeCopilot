import type { ClientOptions } from "./client-options.js";
import { buildCoreClientOptions } from "./core/client-options.js";
import { RawClient } from "./core/raw-client.js";
import * as host from "./core/runtime-environment.js";
import * as s from "./core/validation/index.js";
import { Actions } from "./resources/actions.js";
import { Ai } from "./resources/ai.js";
import { Audit } from "./resources/audit.js";
import { Disputes } from "./resources/disputes.js";
import { System } from "./resources/system.js";
import { buildServers, type Servers } from "./servers.js";

/**
 * REST API for **Dispute Copilot**, an autonomous merchant defense assistant built for the PayPal
 * AI Hackathon. It correlates active PayPal payment disputes with store order fulfillment records,
 * calculates deterministic winnability scores (0–100), synthesizes grounded Evidence Packs, and
 * generates defense response drafts using Gemini AI.
 */
export class DisputeCopilotApiClient {
  readonly #rawClient: RawClient;
  readonly #servers: Servers;
  #system?: System;
  #disputes?: Disputes;
  #ai?: Ai;
  #actions?: Actions;
  #audit?: Audit;

  constructor(options: ClientOptions = {}) {
    this.#rawClient = new RawClient({
      ...buildCoreClientOptions(options, "DISPUTE_COPILOT_API_CLIENT_LOG"),
      defaultHeaders: [
        { name: "User-Agent", value: "DisputeCopilotApiClient/1.0.0 TypeScript", schema: s.string() },
        { name: "X-APIMatic-Lang", value: "TypeScript", schema: s.string() },
        { name: "X-APIMatic-Package-Version", value: "1.0.0", schema: s.string() },
        { name: "X-APIMatic-Gen-Version", value: "4.0.0", schema: s.string() },
        { name: "X-APIMatic-OS", value: host.operatingSystem(), schema: s.optional(s.string()) },
        { name: "X-APIMatic-Runtime", value: host.runtimeDescription(), schema: s.optional(s.string()) },
      ],
      defaultQuery: [],
      defaultPathParams: [],
    });

    this.#servers = buildServers(options);
  }

  /**
   * Health and configuration monitoring endpoints
   */
  get system(): System {
    return (this.#system ??= new System(this.#rawClient, this.#servers));
  }

  /**
   * PayPal dispute retrieval, evidence pack compilation, and scoring
   */
  get disputes(): Disputes {
    return (this.#disputes ??= new Disputes(this.#rawClient, this.#servers));
  }

  /**
   * Grounded defense drafting and citation analysis via Gemini
   */
  get ai(): Ai {
    return (this.#ai ??= new Ai(this.#rawClient, this.#servers));
  }

  /**
   * Merchant-approved PayPal dispute actions (evidence submission, claim acceptance, settlement
   * offers)
   */
  get actions(): Actions {
    return (this.#actions ??= new Actions(this.#rawClient, this.#servers));
  }

  /**
   * Chronological merchant action logging and audit trail
   */
  get audit(): Audit {
    return (this.#audit ??= new Audit(this.#rawClient, this.#servers));
  }
}
