<!-- Generated file — do not edit; regenerated with the SDK. -->

# Disputes — operations

Accessor: `client.disputes` · Source: `src/resources/disputes.ts` · 3 operations · Request and error types: namespace `Disputes`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `dispute-copilot-api`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### getDisputeById

- **Signature**: `getDisputeById(request: Disputes.GetDisputeByIdRequest, options?: RequestOptions): ApiPromise<EnrichedDispute, Disputes.GetDisputeByIdError>`
- **Wire**: `GET /api/disputes/{id}`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `EnrichedDispute`
- **Error**: `DisputeCopilotApiError` with `kind: "api"`, an instance of `Disputes.GetDisputeByIdError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"errorResponse"` [404] `ErrorResponse` · `"errorResponse2"` [500] `ErrorResponse` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Disputes.GetDisputeByIdRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `id` | `path` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `EnrichedDispute` | `enrichedDisputeSchema` | `src/models/enriched-dispute.ts` |
| `ErrorResponse` | `errorResponseSchema` | `src/models/error-response.ts` |

### listDisputes

- **Signature**: `listDisputes(options?: RequestOptions): ApiPromise<DisputesListResponse, Disputes.ListDisputesError>`
- **Wire**: `GET /api/disputes`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `DisputesListResponse`
- **Error**: `DisputeCopilotApiError` with `kind: "api"`, an instance of `Disputes.ListDisputesError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"errorResponse"` [500] `ErrorResponse` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

| Type | Schema value | Source |
| --- | --- | --- |
| `DisputesListResponse` | `disputesListResponseSchema` | `src/models/disputes-list-response.ts` |
| `ErrorResponse` | `errorResponseSchema` | `src/models/error-response.ts` |

### resetDisputesDemo

- **Signature**: `resetDisputesDemo(options?: RequestOptions): ApiPromise<ApiDisputesResetResponse, Disputes.ResetDisputesDemoError>`
- **Wire**: `POST /api/disputes/reset`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `ApiDisputesResetResponse`
- **Error**: `DisputeCopilotApiError` with `kind: "api"`, an instance of `Disputes.ResetDisputesDemoError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"errorResponse"` [500] `ErrorResponse` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

| Type | Schema value | Source |
| --- | --- | --- |
| `ApiDisputesResetResponse` | `apiDisputesResetResponseSchema` | `src/models/api-disputes-reset-response.ts` |
| `ErrorResponse` | `errorResponseSchema` | `src/models/error-response.ts` |

