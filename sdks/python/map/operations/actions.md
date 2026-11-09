<!-- Generated file — do not edit; regenerated with the SDK. -->

# Actions — operations

Accessor: `client.actions` · Source: `dispute_copilot_api/apis/actions.py` · 3 operations

Each `###` block is one operation and assumes `sdk-map.md` is loaded: blocks omit what its invariants table covers and are otherwise self-contained, so chunk at block level. Signatures are the sync parsed spelling; the async and raw spellings take the same parameters (see sdk-map.md). **Type sources** names the module declaring each type an operation mentions, so resolving a body, return or error payload is a lookup rather than a search; the runtime types `RawError` and `ApiResult` are excluded.

### client.actions.accept_claim

- **Route**: `POST /api/disputes/{id}/accept`
- **Signature**: `def accept_claim(id_: str, *, body: AcceptClaimRequest | AcceptClaimRequestDict | None = None, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `id_`
- **Params**: `id_` — path `id` · `body` — JSON body
- **Returns (parsed)**: `ActionResultResponse`
- **Returns (raw)**: `ApiResult[ActionResultResponse, AcceptClaimErrorBody]`
- **Error**: `AcceptClaimErrorBody` — **Case A (typed)**
- **Error arms**: `ErrorResponse` [500] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `AcceptClaimRequest` | `dispute_copilot_api/models/accept_claim_request.py` |
| `AcceptClaimRequestDict` | `dispute_copilot_api/models/accept_claim_request.py` |
| `ActionResultResponse` | `dispute_copilot_api/models/action_result_response.py` |
| `AcceptClaimErrorBody` | `dispute_copilot_api/errors/accept_claim_error.py` |
| `ErrorResponse` | `dispute_copilot_api/models/error_response.py` |

### client.actions.make_offer

- **Route**: `POST /api/disputes/{id}/offer`
- **Signature**: `def make_offer(id_: str, body: MakeOfferRequest | MakeOfferRequestDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `id_`, `body`
- **Params**: `id_` — path `id` · `body` — JSON body
- **Returns (parsed)**: `ActionResultResponse`
- **Returns (raw)**: `ApiResult[ActionResultResponse, MakeOfferErrorBody]`
- **Error**: `MakeOfferErrorBody` — **Case A (typed)**
- **Error arms**: `ValidationErrorResponse` [400] · `ErrorResponse` [500] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `MakeOfferRequest` | `dispute_copilot_api/models/make_offer_request.py` |
| `MakeOfferRequestDict` | `dispute_copilot_api/models/make_offer_request.py` |
| `ActionResultResponse` | `dispute_copilot_api/models/action_result_response.py` |
| `MakeOfferErrorBody` | `dispute_copilot_api/errors/make_offer_error.py` |
| `ValidationErrorResponse` | `dispute_copilot_api/models/validation_error_response.py` |
| `ErrorResponse` | `dispute_copilot_api/models/error_response.py` |

### client.actions.submit_evidence

- **Route**: `POST /api/disputes/{id}/submit-evidence`
- **Signature**: `def submit_evidence(id_: str, body: SubmitEvidenceRequest | SubmitEvidenceRequestDict, *, request_options: RequestOptionsOrDict | None = None)`
  - required, positional: `id_`, `body`
- **Params**: `id_` — path `id` · `body` — JSON body
- **Returns (parsed)**: `ActionResultResponse`
- **Returns (raw)**: `ApiResult[ActionResultResponse, SubmitEvidenceErrorBody]`
- **Error**: `SubmitEvidenceErrorBody` — **Case A (typed)**
- **Error arms**: `ValidationErrorResponse` [400] · `ErrorResponse` [500] · `RawError` [anything unmapped]

| Type | Source |
| --- | --- |
| `SubmitEvidenceRequest` | `dispute_copilot_api/models/submit_evidence_request.py` |
| `SubmitEvidenceRequestDict` | `dispute_copilot_api/models/submit_evidence_request.py` |
| `ActionResultResponse` | `dispute_copilot_api/models/action_result_response.py` |
| `SubmitEvidenceErrorBody` | `dispute_copilot_api/errors/submit_evidence_error.py` |
| `ValidationErrorResponse` | `dispute_copilot_api/models/validation_error_response.py` |
| `ErrorResponse` | `dispute_copilot_api/models/error_response.py` |

