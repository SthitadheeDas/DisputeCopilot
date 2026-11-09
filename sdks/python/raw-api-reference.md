# Raw Reference

**Raw** endpoints, reached through `with_raw_response`, return `ApiResult[T, E]` and never raise for an API error. For the parsed endpoints, see [API Reference](api-reference.md).

> Source: [DisputeCopilotApiClient](dispute_copilot_api/client.py)

## Ai

> Source: [Ai](dispute_copilot_api/apis/ai.py)

<details>
<summary><code>def analyze_dispute(id_: str, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[AnalyzeResponse, AnalyzeDisputeErrorBody]</code></summary>

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

### Usage

<dl>
<dd>

**Sync**

```python
result = client.ai.with_raw_response.analyze_dispute("PP-D-1001")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type AnalyzeResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type AnalyzeDisputeErrorBody
```

**Async**

```python
result = await async_client.ai.with_raw_response.analyze_dispute("PP-D-1001")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type AnalyzeResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type AnalyzeDisputeErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>id_</code> | <code>str</code> | Unique PayPal dispute identifier. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](dispute_copilot_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](dispute_copilot_api/core/results.py)&#91;[AnalyzeResponse](dispute_copilot_api/models/analyze_response.py), [AnalyzeDisputeErrorBody](dispute_copilot_api/errors/analyze_dispute_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[AnalyzeResponse](dispute_copilot_api/models/analyze_response.py)</code> -- AI analysis successfully generated and verified.

**On `Failure`**: `error` is <code>[AnalyzeDisputeErrorBody](dispute_copilot_api/errors/analyze_dispute_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 404, 500 | <code>[ErrorResponse](dispute_copilot_api/models/error_response.py)</code> |
| anything unmapped | <code>[RawError](dispute_copilot_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Actions

> Source: [Actions](dispute_copilot_api/apis/actions.py)

<details>
<summary><code>def accept_claim(id_: str, *, body: AcceptClaimRequest | AcceptClaimRequestDict | None = None, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ActionResultResponse, AcceptClaimErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Concedes liability and accepts the customer claim via PayPal Disputes API v1 (`POST /v1/customer/disputes/{id}/accept-claim`).
Authorizes full refund to buyer. If `DRY_RUN=true`, validates and records action without sending network mutation.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.actions.with_raw_response.accept_claim("PP-D-1001")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ActionResultResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type AcceptClaimErrorBody
```

**Async**

```python
result = await async_client.actions.with_raw_response.accept_claim("PP-D-1001")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ActionResultResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type AcceptClaimErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>id_</code> | <code>str</code> | Unique PayPal dispute identifier. |
| <code>body</code> | <code>[AcceptClaimRequest](dispute_copilot_api/models/accept_claim_request.py) \| [AcceptClaimRequestDict](dispute_copilot_api/models/accept_claim_request.py) \| None</code> | The request body.<br>**Default**: <code>None</code> |
| <code>request_options</code> | <code>[RequestOptionsOrDict](dispute_copilot_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](dispute_copilot_api/core/results.py)&#91;[ActionResultResponse](dispute_copilot_api/models/action_result_response.py), [AcceptClaimErrorBody](dispute_copilot_api/errors/accept_claim_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ActionResultResponse](dispute_copilot_api/models/action_result_response.py)</code> -- Claim accepted or validated under DRY_RUN.

**On `Failure`**: `error` is <code>[AcceptClaimErrorBody](dispute_copilot_api/errors/accept_claim_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 500 | <code>[ErrorResponse](dispute_copilot_api/models/error_response.py)</code> |
| anything unmapped | <code>[RawError](dispute_copilot_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def make_offer(id_: str, body: MakeOfferRequest | MakeOfferRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ActionResultResponse, MakeOfferErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Submits a partial refund settlement offer to the buyer via PayPal Disputes API v1 (`POST /v1/customer/disputes/{id}/make-offer`).
If `DRY_RUN=true`, validates offer amount and records action in audit trail without live mutation.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.actions.with_raw_response.make_offer("PP-D-1001", MakeOfferRequest(amount=1.5))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ActionResultResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type MakeOfferErrorBody
```

**Async**

```python
result = await async_client.actions.with_raw_response.make_offer("PP-D-1001", MakeOfferRequest(amount=1.5))
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ActionResultResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type MakeOfferErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>id_</code> | <code>str</code> | Unique PayPal dispute identifier. |
| <code>body</code> | <code>[MakeOfferRequest](dispute_copilot_api/models/make_offer_request.py) \| [MakeOfferRequestDict](dispute_copilot_api/models/make_offer_request.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](dispute_copilot_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](dispute_copilot_api/core/results.py)&#91;[ActionResultResponse](dispute_copilot_api/models/action_result_response.py), [MakeOfferErrorBody](dispute_copilot_api/errors/make_offer_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ActionResultResponse](dispute_copilot_api/models/action_result_response.py)</code> -- Offer submitted or validated under DRY_RUN.

**On `Failure`**: `error` is <code>[MakeOfferErrorBody](dispute_copilot_api/errors/make_offer_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 400 | <code>[ValidationErrorResponse](dispute_copilot_api/models/validation_error_response.py)</code> |
| 500 | <code>[ErrorResponse](dispute_copilot_api/models/error_response.py)</code> |
| anything unmapped | <code>[RawError](dispute_copilot_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def submit_evidence(id_: str, body: SubmitEvidenceRequest | SubmitEvidenceRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ActionResultResponse, SubmitEvidenceErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Submits merchant evidence statement to PayPal Disputes API v1 (`POST /v1/customer/disputes/{id}/provide-evidence`).
If `DRY_RUN=true`, validates and logs the payload in the audit trail without modifying live account state.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.actions.with_raw_response.submit_evidence(
    "PP-D-1001", SubmitEvidenceRequest(notes="some example string")
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ActionResultResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type SubmitEvidenceErrorBody
```

**Async**

```python
result = await async_client.actions.with_raw_response.submit_evidence(
    "PP-D-1001", SubmitEvidenceRequest(notes="some example string")
)
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ActionResultResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type SubmitEvidenceErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>id_</code> | <code>str</code> | Unique PayPal dispute identifier. |
| <code>body</code> | <code>[SubmitEvidenceRequest](dispute_copilot_api/models/submit_evidence_request.py) \| [SubmitEvidenceRequestDict](dispute_copilot_api/models/submit_evidence_request.py)</code> | The request body. |
| <code>request_options</code> | <code>[RequestOptionsOrDict](dispute_copilot_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](dispute_copilot_api/core/results.py)&#91;[ActionResultResponse](dispute_copilot_api/models/action_result_response.py), [SubmitEvidenceErrorBody](dispute_copilot_api/errors/submit_evidence_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ActionResultResponse](dispute_copilot_api/models/action_result_response.py)</code> -- Evidence submitted or safely validated under DRY_RUN.

**On `Failure`**: `error` is <code>[SubmitEvidenceErrorBody](dispute_copilot_api/errors/submit_evidence_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 400 | <code>[ValidationErrorResponse](dispute_copilot_api/models/validation_error_response.py)</code> |
| 500 | <code>[ErrorResponse](dispute_copilot_api/models/error_response.py)</code> |
| anything unmapped | <code>[RawError](dispute_copilot_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## Audit

> Source: [Audit](dispute_copilot_api/apis/audit.py)

<details>
<summary><code>def get_activity_log(*, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ActivityLogResponse, RawError]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns the chronological, immutable log of merchant actions, submitted evidence statements, and settlement decisions.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.audit.with_raw_response.get_activity_log()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ActivityLogResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

**Async**

```python
result = await async_client.audit.with_raw_response.get_activity_log()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ActivityLogResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>request_options</code> | <code>[RequestOptionsOrDict](dispute_copilot_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](dispute_copilot_api/core/results.py)&#91;[ActivityLogResponse](dispute_copilot_api/models/activity_log_response.py), [RawError](dispute_copilot_api/core/results.py)&#93;</code>

**On `Success`**: `payload` is <code>[ActivityLogResponse](dispute_copilot_api/models/activity_log_response.py)</code> -- Successfully retrieved audit log.

**On `Failure`**: `error` is <code>[RawError](dispute_copilot_api/core/results.py)</code>

</dd>
</dl>

</dd>
</dl>

</details>

## Disputes

> Source: [Disputes](dispute_copilot_api/apis/disputes.py)

<details>
<summary><code>def get_dispute_by_id(id_: str, *, request_options: RequestOptionsOrDict | None = None) -> ApiResult[EnrichedDispute, GetDisputeByIdErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Fetches full details for a specific dispute, including its store order match, evidence pack facts, score breakdown, and cached AI analysis.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.disputes.with_raw_response.get_dispute_by_id("PP-D-1001")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type EnrichedDispute
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetDisputeByIdErrorBody
```

**Async**

```python
result = await async_client.disputes.with_raw_response.get_dispute_by_id("PP-D-1001")
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type EnrichedDispute
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type GetDisputeByIdErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>id_</code> | <code>str</code> | Unique PayPal dispute identifier (e.g. PP-D-1001). |
| <code>request_options</code> | <code>[RequestOptionsOrDict](dispute_copilot_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](dispute_copilot_api/core/results.py)&#91;[EnrichedDispute](dispute_copilot_api/models/enriched_dispute.py), [GetDisputeByIdErrorBody](dispute_copilot_api/errors/get_dispute_by_id_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[EnrichedDispute](dispute_copilot_api/models/enriched_dispute.py)</code> -- Dispute details found and returned.

**On `Failure`**: `error` is <code>[GetDisputeByIdErrorBody](dispute_copilot_api/errors/get_dispute_by_id_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 404, 500 | <code>[ErrorResponse](dispute_copilot_api/models/error_response.py)</code> |
| anything unmapped | <code>[RawError](dispute_copilot_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def list_disputes(*, request_options: RequestOptionsOrDict | None = None) -> ApiResult[DisputesListResponse, ListDisputesErrorBody]</code></summary>

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

### Usage

<dl>
<dd>

**Sync**

```python
result = client.disputes.with_raw_response.list_disputes()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type DisputesListResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ListDisputesErrorBody
```

**Async**

```python
result = await async_client.disputes.with_raw_response.list_disputes()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type DisputesListResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ListDisputesErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>request_options</code> | <code>[RequestOptionsOrDict](dispute_copilot_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](dispute_copilot_api/core/results.py)&#91;[DisputesListResponse](dispute_copilot_api/models/disputes_list_response.py), [ListDisputesErrorBody](dispute_copilot_api/errors/list_disputes_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[DisputesListResponse](dispute_copilot_api/models/disputes_list_response.py)</code> -- Successfully retrieved list of enriched disputes.

**On `Failure`**: `error` is <code>[ListDisputesErrorBody](dispute_copilot_api/errors/list_disputes_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 500 | <code>[ErrorResponse](dispute_copilot_api/models/error_response.py)</code> |
| anything unmapped | <code>[RawError](dispute_copilot_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

<details>
<summary><code>def reset_disputes_demo(*, request_options: RequestOptionsOrDict | None = None) -> ApiResult[ApiDisputesResetResponse, ResetDisputesDemoErrorBody]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Resets mock fixture disputes back to their initial active state (6 active disputes, clearing test concessions/refunds).

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.disputes.with_raw_response.reset_disputes_demo()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ApiDisputesResetResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ResetDisputesDemoErrorBody
```

**Async**

```python
result = await async_client.disputes.with_raw_response.reset_disputes_demo()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type ApiDisputesResetResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type ResetDisputesDemoErrorBody
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>request_options</code> | <code>[RequestOptionsOrDict](dispute_copilot_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](dispute_copilot_api/core/results.py)&#91;[ApiDisputesResetResponse](dispute_copilot_api/models/api_disputes_reset_response.py), [ResetDisputesDemoErrorBody](dispute_copilot_api/errors/reset_disputes_demo_error.py)&#93;</code>

**On `Success`**: `payload` is <code>[ApiDisputesResetResponse](dispute_copilot_api/models/api_disputes_reset_response.py)</code> -- Mock dispute database successfully reset.

**On `Failure`**: `error` is <code>[ResetDisputesDemoErrorBody](dispute_copilot_api/errors/reset_disputes_demo_error.py)</code>

Mapped in first-match order -- an earlier row wins over a later range that also covers the status:

| Status | `error` is |
| --- | --- |
| 500 | <code>[ErrorResponse](dispute_copilot_api/models/error_response.py)</code> |
| anything unmapped | <code>[RawError](dispute_copilot_api/core/results.py)</code> |

</dd>
</dl>

</dd>
</dl>

</details>

## System

> Source: [System](dispute_copilot_api/apis/system.py)

<details>
<summary><code>def get_health(*, request_options: RequestOptionsOrDict | None = None) -> ApiResult[HealthResponse, RawError]</code></summary>

<dl>
<dd>

### Description

<dl>
<dd>

Returns service operational status, active data mode (sandbox vs fixture), dry run safety flag, and order/dispute statistics.

</dd>
</dl>

### Usage

<dl>
<dd>

**Sync**

```python
result = client.system.with_raw_response.get_health()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type HealthResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

**Async**

```python
result = await async_client.system.with_raw_response.get_health()
match result:
    case Success(payload=payload):
        ...  # TODO: Handle 'payload' of type HealthResponse
    case Failure(error=error):
        ...  # TODO: Handle 'error' of type RawError
```

</dd>
</dl>

### Parameters

<dl>
<dd>

| Name | Type | Description |
| --- | --- | --- |
| <code>request_options</code> | <code>[RequestOptionsOrDict](dispute_copilot_api/core/request_options.py) \| None</code> | Per-call overrides for this one request, such as a timeout, extra headers, or its retry count and statuses. |

</dd>
</dl>

### Response

<dl>
<dd>

**Returns**: <code>[ApiResult](dispute_copilot_api/core/results.py)&#91;[HealthResponse](dispute_copilot_api/models/health_response.py), [RawError](dispute_copilot_api/core/results.py)&#93;</code>

**On `Success`**: `payload` is <code>[HealthResponse](dispute_copilot_api/models/health_response.py)</code> -- Service is healthy and configured.

**On `Failure`**: `error` is <code>[RawError](dispute_copilot_api/core/results.py)</code>

</dd>
</dl>

</dd>
</dl>

</details>

