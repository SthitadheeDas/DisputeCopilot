# Reference

> Source: [DisputeCopilotApiClient](src/client.ts)

## System

> Source: [System](src/resources/system.ts)

<details>
<summary><code>getHealth(options?: RequestOptions): ApiPromise&lt;HealthResponse, ApiError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns service operational status, active data mode (sandbox vs fixture), dry run safety flag, and order/dispute statistics.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.system.getHealth();
  // TODO: Handle 'response' of type HealthResponse
} catch (err) {
  // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.system.getHealth().asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type HealthResponse
} else {
  // TODO: Handle 'result', where 'result.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.system.getHealth()`

- **OnSuccess**: <code>[HealthResponse](src/models/health-response.ts)</code>
- **OnError**: throws <code>[ApiError](src/core/api-error.ts)</code>, with `err.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm

**As ApiResult**: `await client.system.getHealth().asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;HealthResponse, ApiError&gt;</code>, with `result.value` of type <code>[HealthResponse](src/models/health-response.ts)</code>
- **OnError**: `result.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm, with `result.message`

**Thrown**: <code>[DisputeCopilotApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Disputes

> Source: [Disputes](src/resources/disputes.ts)

<details>
<summary><code>getDisputeById(request: Disputes.GetDisputeByIdRequest, options?: RequestOptions): ApiPromise&lt;EnrichedDispute, Disputes.GetDisputeByIdError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Fetches full details for a specific dispute, including its store order match, evidence pack facts, score breakdown, and cached AI analysis.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.disputes.getDisputeById({ id: "PP-D-1001" });
  // TODO: Handle 'response' of type EnrichedDispute
} catch (err) {
  // TODO: Handle 'err' of type Disputes.GetDisputeByIdError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.disputes.getDisputeById({ id: "PP-D-1001" }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type EnrichedDispute
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>id</code> | <code>string</code> | Unique PayPal dispute identifier (e.g. PP-D-1001). |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.disputes.getDisputeById(request)`

- **OnSuccess**: <code>[EnrichedDispute](src/models/enriched-dispute.ts)</code>
- **OnError**: throws <code>[Disputes.GetDisputeByIdError](src/resources/disputes.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.disputes.getDisputeById(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;EnrichedDispute, Disputes.GetDisputeByIdError&gt;</code>, with `result.value` of type <code>[EnrichedDispute](src/models/enriched-dispute.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[DisputeCopilotApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>listDisputes(options?: RequestOptions): ApiPromise&lt;DisputesListResponse, Disputes.ListDisputesError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Retrieves all active PayPal customer disputes enriched with matched store order data,
indexed Evidence Packs, deterministic winnability scores, and live deadline calculations.
Results are sorted ascending by response deadline.


</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.disputes.listDisputes();
  // TODO: Handle 'response' of type DisputesListResponse
} catch (err) {
  // TODO: Handle 'err' of type Disputes.ListDisputesError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.disputes.listDisputes().asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type DisputesListResponse
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.disputes.listDisputes()`

- **OnSuccess**: <code>[DisputesListResponse](src/models/disputes-list-response.ts)</code>
- **OnError**: throws <code>[Disputes.ListDisputesError](src/resources/disputes.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.disputes.listDisputes().asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;DisputesListResponse, Disputes.ListDisputesError&gt;</code>, with `result.value` of type <code>[DisputesListResponse](src/models/disputes-list-response.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[DisputeCopilotApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>resetDisputesDemo(options?: RequestOptions): ApiPromise&lt;ApiDisputesResetResponse, Disputes.ResetDisputesDemoError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Resets mock fixture disputes back to their initial active state (6 active disputes, clearing test concessions/refunds).

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.disputes.resetDisputesDemo();
  // TODO: Handle 'response' of type ApiDisputesResetResponse
} catch (err) {
  // TODO: Handle 'err' of type Disputes.ResetDisputesDemoError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.disputes.resetDisputesDemo().asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ApiDisputesResetResponse
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.disputes.resetDisputesDemo()`

- **OnSuccess**: <code>[ApiDisputesResetResponse](src/models/api-disputes-reset-response.ts)</code>
- **OnError**: throws <code>[Disputes.ResetDisputesDemoError](src/resources/disputes.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.disputes.resetDisputesDemo().asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ApiDisputesResetResponse, Disputes.ResetDisputesDemoError&gt;</code>, with `result.value` of type <code>[ApiDisputesResetResponse](src/models/api-disputes-reset-response.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[DisputeCopilotApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Ai

> Source: [Ai](src/resources/ai.ts)

<details>
<summary><code>analyzeDispute(request: Ai.AnalyzeDisputeRequest, options?: RequestOptions): ApiPromise&lt;AnalyzeResponse, Ai.AnalyzeDisputeError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Invokes Google Gemini to evaluate the dispute and Evidence Pack.
Produces structured JSON containing strategic recommendation (FIGHT / ACCEPT / PARTIAL_OFFER),
summary, and a factual draft defense strictly citing Evidence Pack fact IDs ([F1], [F2]).
Validates all citations against the Evidence Pack and caches the output locally.


</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.ai.analyzeDispute({ id: "PP-D-1001" });
  // TODO: Handle 'response' of type AnalyzeResponse
} catch (err) {
  // TODO: Handle 'err' of type Ai.AnalyzeDisputeError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.ai.analyzeDispute({ id: "PP-D-1001" }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type AnalyzeResponse
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>id</code> | <code>string</code> | Unique PayPal dispute identifier. |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.ai.analyzeDispute(request)`

- **OnSuccess**: <code>[AnalyzeResponse](src/models/analyze-response.ts)</code>
- **OnError**: throws <code>[Ai.AnalyzeDisputeError](src/resources/ai.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.ai.analyzeDispute(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;AnalyzeResponse, Ai.AnalyzeDisputeError&gt;</code>, with `result.value` of type <code>[AnalyzeResponse](src/models/analyze-response.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[DisputeCopilotApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Actions

> Source: [Actions](src/resources/actions.ts)

<details>
<summary><code>acceptClaim(request: Actions.AcceptClaimRequestParams, options?: RequestOptions): ApiPromise&lt;ActionResultResponse, Actions.AcceptClaimError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Concedes liability and accepts the customer claim via PayPal Disputes API v1 (`POST /v1/customer/disputes/{id}/accept-claim`).
Authorizes full refund to buyer. If `DRY_RUN=true`, validates and records action without sending network mutation.


</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.actions.acceptClaim({ id: "PP-D-1001" });
  // TODO: Handle 'response' of type ActionResultResponse
} catch (err) {
  // TODO: Handle 'err' of type Actions.AcceptClaimError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.actions.acceptClaim({ id: "PP-D-1001" }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ActionResultResponse
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>id</code> | <code>string</code> | Unique PayPal dispute identifier. |
| <code>body?</code> | <code>[AcceptClaimRequest](src/models/accept-claim-request.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.actions.acceptClaim(request)`

- **OnSuccess**: <code>[ActionResultResponse](src/models/action-result-response.ts)</code>
- **OnError**: throws <code>[Actions.AcceptClaimError](src/resources/actions.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.actions.acceptClaim(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ActionResultResponse, Actions.AcceptClaimError&gt;</code>, with `result.value` of type <code>[ActionResultResponse](src/models/action-result-response.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[DisputeCopilotApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>makeOffer(request: Actions.MakeOfferRequestParams, options?: RequestOptions): ApiPromise&lt;ActionResultResponse, Actions.MakeOfferError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Submits a partial refund settlement offer to the buyer via PayPal Disputes API v1 (`POST /v1/customer/disputes/{id}/make-offer`).
If `DRY_RUN=true`, validates offer amount and records action in audit trail without live mutation.


</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.actions.makeOffer({ id: "PP-D-1001", body: { amount: 1.5 } });
  // TODO: Handle 'response' of type ActionResultResponse
} catch (err) {
  // TODO: Handle 'err' of type Actions.MakeOfferError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.actions.makeOffer({ id: "PP-D-1001", body: { amount: 1.5 } }).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ActionResultResponse
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>id</code> | <code>string</code> | Unique PayPal dispute identifier. |
| <code>body</code> | <code>[MakeOfferRequest](src/models/make-offer-request.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.actions.makeOffer(request)`

- **OnSuccess**: <code>[ActionResultResponse](src/models/action-result-response.ts)</code>
- **OnError**: throws <code>[Actions.MakeOfferError](src/resources/actions.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.actions.makeOffer(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ActionResultResponse, Actions.MakeOfferError&gt;</code>, with `result.value` of type <code>[ActionResultResponse](src/models/action-result-response.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[DisputeCopilotApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>submitEvidence(request: Actions.SubmitEvidenceRequestParams, options?: RequestOptions): ApiPromise&lt;ActionResultResponse, Actions.SubmitEvidenceError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Submits merchant evidence statement to PayPal Disputes API v1 (`POST /v1/customer/disputes/{id}/provide-evidence`).
If `DRY_RUN=true`, validates and logs the payload in the audit trail without modifying live account state.


</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.actions.submitEvidence({
    id: "PP-D-1001",
    body: { notes: "some example string" },
  });
  // TODO: Handle 'response' of type ActionResultResponse
} catch (err) {
  // TODO: Handle 'err' of type Actions.SubmitEvidenceError, discriminated with 'err.payload.kind'
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.actions.submitEvidence({
  id: "PP-D-1001",
  body: { notes: "some example string" },
}).asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ActionResultResponse
} else {
  // TODO: Handle 'result', discriminated with 'result.payload.kind'
}
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>id</code> | <code>string</code> | Unique PayPal dispute identifier. |
| <code>body</code> | <code>[SubmitEvidenceRequest](src/models/submit-evidence-request.ts)</code> | - |

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.actions.submitEvidence(request)`

- **OnSuccess**: <code>[ActionResultResponse](src/models/action-result-response.ts)</code>
- **OnError**: throws <code>[Actions.SubmitEvidenceError](src/resources/actions.ts)</code>, with `err.payload` discriminated on `kind`

**As ApiResult**: `await client.actions.submitEvidence(request).asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ActionResultResponse, Actions.SubmitEvidenceError&gt;</code>, with `result.value` of type <code>[ActionResultResponse](src/models/action-result-response.ts)</code>
- **OnError**: `result.payload` discriminated on `kind`, with `result.message`

**Thrown**: <code>[DisputeCopilotApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

## Audit

> Source: [Audit](src/resources/audit.ts)

<details>
<summary><code>getActivityLog(options?: RequestOptions): ApiPromise&lt;ActivityLogResponse, ApiError&gt;</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns the chronological, immutable log of merchant actions, submitted evidence statements, and settlement decisions.

</dd>
</dl>

### Direct Usage

<dl>
<dd>

```ts
try {
  const response = await client.audit.getActivityLog();
  // TODO: Handle 'response' of type ActivityLogResponse
} catch (err) {
  // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Usage as ApiResult

<dl>
<dd>

```ts
const result = await client.audit.getActivityLog().asApiResult();
// TODO: Use 'result.status' and 'result.headers' to read the raw response status and headers
if (result.ok) {
  // TODO: Use 'result.value' of type ActivityLogResponse
} else {
  // TODO: Handle 'result', where 'result.payload' is always the Undeclared arm
}
```

</dd>
</dl>

### Response

<dl>
<dd>

**Direct**: `await client.audit.getActivityLog()`

- **OnSuccess**: <code>[ActivityLogResponse](src/models/activity-log-response.ts)</code>
- **OnError**: throws <code>[ApiError](src/core/api-error.ts)</code>, with `err.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm

**As ApiResult**: `await client.audit.getActivityLog().asApiResult()`

- **OnSuccess**: <code>[ApiResult](src/core/api-promise.ts)&lt;ActivityLogResponse, ApiError&gt;</code>, with `result.value` of type <code>[ActivityLogResponse](src/models/activity-log-response.ts)</code>
- **OnError**: `result.payload` always the <code>[Undeclared](src/core/api-error.ts)</code> arm, with `result.message`

**Thrown**: <code>[DisputeCopilotApiError](src/core/errors.ts)</code> on any operational failure — a caller abort and a programmer error stay outside the family and reach you raw

</dd>
</dl>

</dd>
</dl>

</details>

