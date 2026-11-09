<!-- Generated file — do not edit; regenerated with the SDK. -->

# Ai — operations

Accessor: `client.ai` · Source: `dispute_copilot_api/apis/ai.py` · 1 operation

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.ai.analyze_dispute

- **Route**: `POST /api/disputes/{id}/analyze`
- **Signature**: `def analyze_dispute(id_: str, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `id_`
- **Params**: `id_` — path `id`
- **Returns (parsed)**: `AnalyzeResponse`
- **Returns (raw)**: `ApiResult[AnalyzeResponse, AnalyzeDisputeErrorBody]`
- **Error**: `AnalyzeDisputeErrorBody` — **Case A (typed)**
- **Error arms**: `ErrorResponse` [404, 500] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `AnalyzeResponse` | `dispute_copilot_api/models/analyze_response.py` |
| `AnalyzeDisputeErrorBody` | `dispute_copilot_api/errors/analyze_dispute_error.py` |
| `ErrorResponse` | `dispute_copilot_api/models/error_response.py` |

