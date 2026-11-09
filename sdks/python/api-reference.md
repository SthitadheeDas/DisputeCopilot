# Reference

**Parsed** endpoints return the typed payload and raise `ApiError` on a documented non-2xx. For the raw endpoints, see [Raw API Reference](raw-api-reference.md).

> Source: [DisputeCopilotApiClient](dispute_copilot_api/client.py)

## Ai

> Source: [Ai](dispute_copilot_api/apis/ai.py)

<details>
<summary><code>def analyze_dispute(id_: str, *, request_options: RequestOptionsOrDict | None = None) -> AnalyzeResponse</code></summary>

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
try:
    response = client.ai.analyze_dispute("PP-D-1001")
    # TODO: Handle 'response' of type AnalyzeResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type AnalyzeDisputeErrorBody
```

**Async**

```python
try:
    response = await async_client.ai.analyze_dispute("PP-D-1001")
    # TODO: Handle 'response' of type AnalyzeResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type AnalyzeDisputeErrorBody
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

**OnSuccess**: <code>[AnalyzeResponse](dispute_copilot_api/models/analyze_response.py)</code> -- AI analysis successfully generated and verified.

**OnError**: <code>[ApiError](dispute_copilot_api/core/exceptions.py)&#91;[AnalyzeDisputeErrorBody](dispute_copilot_api/errors/analyze_dispute_error.py)&#93;</code>

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
<summary><code>def accept_claim(id_: str, *, body: AcceptClaimRequest | AcceptClaimRequestDict | None = None, request_options: RequestOptionsOrDict | None = None) -> ActionResultResponse</code></summary>

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
try:
    response = client.actions.accept_claim("PP-D-1001")
    # TODO: Handle 'response' of type ActionResultResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type AcceptClaimErrorBody
```

**Async**

```python
try:
    response = await async_client.actions.accept_claim("PP-D-1001")
    # TODO: Handle 'response' of type ActionResultResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type AcceptClaimErrorBody
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

**OnSuccess**: <code>[ActionResultResponse](dispute_copilot_api/models/action_result_response.py)</code> -- Claim accepted or validated under DRY_RUN.

**OnError**: <code>[ApiError](dispute_copilot_api/core/exceptions.py)&#91;[AcceptClaimErrorBody](dispute_copilot_api/errors/accept_claim_error.py)&#93;</code>

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
<summary><code>def make_offer(id_: str, body: MakeOfferRequest | MakeOfferRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> ActionResultResponse</code></summary>

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
try:
    response = client.actions.make_offer("PP-D-1001", MakeOfferRequest(amount=1.5))
    # TODO: Handle 'response' of type ActionResultResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type MakeOfferErrorBody
```

**Async**

```python
try:
    response = await async_client.actions.make_offer("PP-D-1001", MakeOfferRequest(amount=1.5))
    # TODO: Handle 'response' of type ActionResultResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type MakeOfferErrorBody
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

**OnSuccess**: <code>[ActionResultResponse](dispute_copilot_api/models/action_result_response.py)</code> -- Offer submitted or validated under DRY_RUN.

**OnError**: <code>[ApiError](dispute_copilot_api/core/exceptions.py)&#91;[MakeOfferErrorBody](dispute_copilot_api/errors/make_offer_error.py)&#93;</code>

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
<summary><code>def submit_evidence(id_: str, body: SubmitEvidenceRequest | SubmitEvidenceRequestDict, *, request_options: RequestOptionsOrDict | None = None) -> ActionResultResponse</code></summary>

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
try:
    response = client.actions.submit_evidence("PP-D-1001", SubmitEvidenceRequest(notes="some example string"))
    # TODO: Handle 'response' of type ActionResultResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type SubmitEvidenceErrorBody
```

**Async**

```python
try:
    response = await async_client.actions.submit_evidence(
        "PP-D-1001", SubmitEvidenceRequest(notes="some example string")
    )
    # TODO: Handle 'response' of type ActionResultResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type SubmitEvidenceErrorBody
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

**OnSuccess**: <code>[ActionResultResponse](dispute_copilot_api/models/action_result_response.py)</code> -- Evidence submitted or safely validated under DRY_RUN.

**OnError**: <code>[ApiError](dispute_copilot_api/core/exceptions.py)&#91;[SubmitEvidenceErrorBody](dispute_copilot_api/errors/submit_evidence_error.py)&#93;</code>

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
<summary><code>def get_activity_log(*, request_options: RequestOptionsOrDict | None = None) -> ActivityLogResponse</code></summary>

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
try:
    response = client.audit.get_activity_log()
    # TODO: Handle 'response' of type ActivityLogResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
```

**Async**

```python
try:
    response = await async_client.audit.get_activity_log()
    # TODO: Handle 'response' of type ActivityLogResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
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

**OnSuccess**: <code>[ActivityLogResponse](dispute_copilot_api/models/activity_log_response.py)</code> -- Successfully retrieved audit log.

**OnError**: <code>[ApiError](dispute_copilot_api/core/exceptions.py)&#91;[RawError](dispute_copilot_api/core/results.py)&#93;</code>

</dd>
</dl>

</dd>
</dl>

</details>

## Disputes

> Source: [Disputes](dispute_copilot_api/apis/disputes.py)

<details>
<summary><code>def get_dispute_by_id(id_: str, *, request_options: RequestOptionsOrDict | None = None) -> EnrichedDispute</code></summary>

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
try:
    response = client.disputes.get_dispute_by_id("PP-D-1001")
    # TODO: Handle 'response' of type EnrichedDispute
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetDisputeByIdErrorBody
```

**Async**

```python
try:
    response = await async_client.disputes.get_dispute_by_id("PP-D-1001")
    # TODO: Handle 'response' of type EnrichedDispute
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type GetDisputeByIdErrorBody
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

**OnSuccess**: <code>[EnrichedDispute](dispute_copilot_api/models/enriched_dispute.py)</code> -- Dispute details found and returned.

**OnError**: <code>[ApiError](dispute_copilot_api/core/exceptions.py)&#91;[GetDisputeByIdErrorBody](dispute_copilot_api/errors/get_dispute_by_id_error.py)&#93;</code>

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
<summary><code>def list_disputes(*, request_options: RequestOptionsOrDict | None = None) -> DisputesListResponse</code></summary>

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
try:
    response = client.disputes.list_disputes()
    # TODO: Handle 'response' of type DisputesListResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ListDisputesErrorBody
```

**Async**

```python
try:
    response = await async_client.disputes.list_disputes()
    # TODO: Handle 'response' of type DisputesListResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ListDisputesErrorBody
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

**OnSuccess**: <code>[DisputesListResponse](dispute_copilot_api/models/disputes_list_response.py)</code> -- Successfully retrieved list of enriched disputes.

**OnError**: <code>[ApiError](dispute_copilot_api/core/exceptions.py)&#91;[ListDisputesErrorBody](dispute_copilot_api/errors/list_disputes_error.py)&#93;</code>

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
<summary><code>def reset_disputes_demo(*, request_options: RequestOptionsOrDict | None = None) -> ApiDisputesResetResponse</code></summary>

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
try:
    response = client.disputes.reset_disputes_demo()
    # TODO: Handle 'response' of type ApiDisputesResetResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ResetDisputesDemoErrorBody
```

**Async**

```python
try:
    response = await async_client.disputes.reset_disputes_demo()
    # TODO: Handle 'response' of type ApiDisputesResetResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type ResetDisputesDemoErrorBody
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

**OnSuccess**: <code>[ApiDisputesResetResponse](dispute_copilot_api/models/api_disputes_reset_response.py)</code> -- Mock dispute database successfully reset.

**OnError**: <code>[ApiError](dispute_copilot_api/core/exceptions.py)&#91;[ResetDisputesDemoErrorBody](dispute_copilot_api/errors/reset_disputes_demo_error.py)&#93;</code>

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
<summary><code>def get_health(*, request_options: RequestOptionsOrDict | None = None) -> HealthResponse</code></summary>

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
try:
    response = client.system.get_health()
    # TODO: Handle 'response' of type HealthResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
```

**Async**

```python
try:
    response = await async_client.system.get_health()
    # TODO: Handle 'response' of type HealthResponse
except ApiError as e:
    ...  # TODO: Handle 'e.error' of type RawError
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

**OnSuccess**: <code>[HealthResponse](dispute_copilot_api/models/health_response.py)</code> -- Service is healthy and configured.

**OnError**: <code>[ApiError](dispute_copilot_api/core/exceptions.py)&#91;[RawError](dispute_copilot_api/core/results.py)&#93;</code>

</dd>
</dl>

</dd>
</dl>

</details>

