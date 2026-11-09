<!-- Generated file — do not edit; regenerated with the SDK. -->

# Ai — operations

Accessor: `client.ai` · Source: `src/resources/ai.ts` · 1 operation · Request and error types: namespace `Ai`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `dispute-copilot-api`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### analyzeDispute

- **Signature**: `analyzeDispute(request: Ai.AnalyzeDisputeRequest, options?: RequestOptions): ApiPromise<AnalyzeResponse, Ai.AnalyzeDisputeError>`
- **Wire**: `POST /api/disputes/{id}/analyze`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **SDK-sent**: `header Idempotency-Key` (minted per call)
- **Returns**: `AnalyzeResponse`
- **Error**: `DisputeCopilotApiError` with `kind: "api"`, an instance of `Ai.AnalyzeDisputeError` — **typed arms**, narrowed on `err.payload.kind`
- **Error arms**: `"errorResponse"` [404] `ErrorResponse` · `"errorResponse2"` [500] `ErrorResponse` · `"undeclared"` [any other] `rawBody: ArrayBuffer`

**Fields** — `Ai.AnalyzeDisputeRequest` (1):

| Field | Channel | Type | Req |
| --- | --- | --- | --- |
| `id` | `path` | `string` | yes |

| Type | Schema value | Source |
| --- | --- | --- |
| `AnalyzeResponse` | `analyzeResponseSchema` | `src/models/analyze-response.ts` |
| `ErrorResponse` | `errorResponseSchema` | `src/models/error-response.ts` |

