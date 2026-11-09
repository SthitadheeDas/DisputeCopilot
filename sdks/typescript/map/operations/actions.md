<!-- Generated file — do not edit; regenerated with the SDK. -->

# Actions — operations

Accessor: `client.actions` · Source: `src/resources/actions.ts` · 3 operations · Request and error types: namespace `Actions`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `dispute-copilot-api`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### acceptClaim

- **Signature**: `acceptClaim(request: Actions.AcceptClaimRequestParams, options?: RequestOptions): ApiPromise<ActionResultResponse, Actions.AcceptClaimError>`
- **Wire**: `POST /api/disputes/{id}/accept`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field. **Optional**: omit it and the request carries no body and no `Content-Type` header at all
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `ActionResultResponse`
- **Error**: `DisputeCopilotApiError` with `kind: "api"`, an instance of `Actions.AcceptClaimError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"errorResponse"` [500] `ErrorResponse` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Actions.AcceptClaimRequestParams` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `id` | `path` | `string` | yes |
| `body` | `body` | `AcceptClaimRequest` | no |

| Type | Schema value | Source |
| --- | --- | --- |
| `AcceptClaimRequest` | `acceptClaimRequestSchema` | `src/models/accept-claim-request.ts` |
| `ActionResultResponse` | `actionResultResponseSchema` | `src/models/action-result-response.ts` |
| `ErrorResponse` | `errorResponseSchema` | `src/models/error-response.ts` |

### makeOffer

- **Signature**: `makeOffer(request: Actions.MakeOfferRequestParams, options?: RequestOptions): ApiPromise<ActionResultResponse, Actions.MakeOfferError>`
- **Wire**: `POST /api/disputes/{id}/offer`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `ActionResultResponse`
- **Error**: `DisputeCopilotApiError` with `kind: "api"`, an instance of `Actions.MakeOfferError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"validationErrorResponse"` [400] `ValidationErrorResponse` · `"errorResponse"` [500] `ErrorResponse` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Actions.MakeOfferRequestParams` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `id` | `path` | `string` | yes |
| `body` | `body` | `MakeOfferRequest` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `MakeOfferRequest` | `makeOfferRequestSchema` | `src/models/make-offer-request.ts` |
| `ActionResultResponse` | `actionResultResponseSchema` | `src/models/action-result-response.ts` |
| `ValidationErrorResponse` | `validationErrorResponseSchema` | `src/models/validation-error-response.ts` |
| `ErrorResponse` | `errorResponseSchema` | `src/models/error-response.ts` |

### submitEvidence

- **Signature**: `submitEvidence(request: Actions.SubmitEvidenceRequestParams, options?: RequestOptions): ApiPromise<ActionResultResponse, Actions.SubmitEvidenceError>`
- **Wire**: `POST /api/disputes/{id}/submit-evidence`
- **Auth**: none — public; no credential is sent
- **Request body**: `application/json` — the `body` field
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `ActionResultResponse`
- **Error**: `DisputeCopilotApiError` with `kind: "api"`, an instance of `Actions.SubmitEvidenceError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"validationErrorResponse"` [400] `ValidationErrorResponse` · `"errorResponse"` [500] `ErrorResponse` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Actions.SubmitEvidenceRequestParams` (2):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `id` | `path` | `string` | yes |
| `body` | `body` | `SubmitEvidenceRequest` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `SubmitEvidenceRequest` | `submitEvidenceRequestSchema` | `src/models/submit-evidence-request.ts` |
| `ActionResultResponse` | `actionResultResponseSchema` | `src/models/action-result-response.ts` |
| `ValidationErrorResponse` | `validationErrorResponseSchema` | `src/models/validation-error-response.ts` |
| `ErrorResponse` | `errorResponseSchema` | `src/models/error-response.ts` |

