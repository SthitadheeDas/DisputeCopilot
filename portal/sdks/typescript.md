# TypeScript SDK (/sdks/typescript)

[Download SDK](/__downloads/sdk/typescript.zip)

## Intro [#intro]

The Dispute Copilot API SDK provides access to the Dispute Copilot API REST APIs.

REST API for **Dispute Copilot**, an autonomous merchant defense assistant built for the PayPal AI Hackathon.
It correlates active PayPal payment disputes with store order fulfillment records, calculates deterministic
winnability scores (0–100), synthesizes grounded Evidence Packs, and generates defense response drafts using Gemini AI.

## Installation [#installation]

The SDK compiles to `dist/` before it can be referenced — run its `build` script once in the SDK folder, then add it to your project by path:

```bash
npm install <path-to-sdk>
```

## Quick Start [#quick-start]

Create one client and reuse it. Configure its behaviour through `ClientOptions`.

```ts
import { DisputeCopilotApiClient, ServerEnvironment } from "dispute-copilot-api";

const client = new DisputeCopilotApiClient({ serverEnvironment: ServerEnvironment.Production });
```

Nothing in `ClientOptions` is required — `new DisputeCopilotApiClient()` compiles — and each option left out falls back to its default. `serverEnvironment` is spelled out above so the environment a call reaches is visible where the client is built rather than inherited silently.

### From CommonJS [#from-commonjs]

The package ships both dialects from a single entry, so `require` works with full types. In a TypeScript CommonJS file use the `import ... = require(...)` form — a plain destructuring `require` runs fine but gives you `any`.

```ts
import sdk = require("dispute-copilot-api");

const client = new sdk.DisputeCopilotApiClient({ serverEnvironment: sdk.ServerEnvironment.Production });
```