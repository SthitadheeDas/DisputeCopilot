<!-- Generated file — do not edit; regenerated with the SDK. -->

# Disputes — operations

Accessor: `client.disputes` · Source: `dispute_copilot_api/apis/disputes.py` · 3 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.disputes.get_dispute_by_id

- **Route**: `GET /api/disputes/{id}`
- **Signature**: `def get_dispute_by_id(id_: str, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `id_`
- **Params**: `id_` — path `id`
- **Returns (parsed)**: `EnrichedDispute`
- **Returns (raw)**: `ApiResult[EnrichedDispute, GetDisputeByIdErrorBody]`
- **Error**: `GetDisputeByIdErrorBody` — **Case A (typed)**
- **Error arms**: `ErrorResponse` [404, 500] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `EnrichedDispute` | `dispute_copilot_api/models/enriched_dispute.py` |
| `GetDisputeByIdErrorBody` | `dispute_copilot_api/errors/get_dispute_by_id_error.py` |
| `ErrorResponse` | `dispute_copilot_api/models/error_response.py` |

### client.disputes.list_disputes

- **Route**: `GET /api/disputes`
- **Signature**: `def list_disputes(*, request_options: RequestOptionsOrDict | None = None)`
- **Returns (parsed)**: `DisputesListResponse`
- **Returns (raw)**: `ApiResult[DisputesListResponse, ListDisputesErrorBody]`
- **Error**: `ListDisputesErrorBody` — **Case A (typed)**
- **Error arms**: `ErrorResponse` [500] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `DisputesListResponse` | `dispute_copilot_api/models/disputes_list_response.py` |
| `ListDisputesErrorBody` | `dispute_copilot_api/errors/list_disputes_error.py` |
| `ErrorResponse` | `dispute_copilot_api/models/error_response.py` |

### client.disputes.reset_disputes_demo

- **Route**: `POST /api/disputes/reset`
- **Signature**: `def reset_disputes_demo(*, request_options: RequestOptionsOrDict | None = None)`
- **Returns (parsed)**: `ApiDisputesResetResponse`
- **Returns (raw)**: `ApiResult[ApiDisputesResetResponse, ResetDisputesDemoErrorBody]`
- **Error**: `ResetDisputesDemoErrorBody` — **Case A (typed)**
- **Error arms**: `ErrorResponse` [500] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `ApiDisputesResetResponse` | `dispute_copilot_api/models/api_disputes_reset_response.py` |
| `ResetDisputesDemoErrorBody` | `dispute_copilot_api/errors/reset_disputes_demo_error.py` |
| `ErrorResponse` | `dispute_copilot_api/models/error_response.py` |

