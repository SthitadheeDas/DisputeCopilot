<!-- Generated file — do not edit; regenerated with the SDK. -->

# Audit — operations

Accessor: `client.audit` · Source: `dispute_copilot_api/apis/audit.py` · 1 operation

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.audit.get_activity_log

- **Route**: `GET /api/activity`
- **Signature**: `def get_activity_log(*, request_options: RequestOptionsOrDict | None = None)`
- **Returns (parsed)**: `ActivityLogResponse`
- **Returns (raw)**: `ApiResult[ActivityLogResponse, RawError]`
- **Error**: `RawError` — **Case B**

| Type | Source |
| --- | --- |
| `ActivityLogResponse` | `dispute_copilot_api/models/activity_log_response.py` |

