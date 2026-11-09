<!-- Generated file — do not edit; regenerated with the SDK. -->

# Audit — operations

Accessor: `client.audit` · Source: `src/resources/audit.ts` · 1 operation · Request types: namespace `Audit`

**Type sources**: every type an operation names, with the file that declares it and the schema value exported beside it. Import every name from `dispute-copilot-api`; the `Source` path is where to **read** the shape, never what to import. `ApiError`, the runtime error family and the file vocabulary are excluded — see sdk-map.md.

### getActivityLog

- **Signature**: `getActivityLog(options?: RequestOptions): ApiPromise<ActivityLogResponse, ApiError>`
- **Wire**: `GET /api/activity`
- **Auth**: none — public; no credential is sent
- **Request body**: none — no `Content-Type` header is sent
- **Returns**: `ActivityLogResponse`
- **Error**: `DisputeCopilotApiError` with `kind: "api"` — untyped, `payload.kind` always `"undeclared"`

| Type | Schema value | Source |
| --- | --- | --- |
| `ActivityLogResponse` | `activityLogResponseSchema` | `src/models/activity-log-response.ts` |

