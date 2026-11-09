# Retrieve Merchant Audit Trail (/api/openapi/audit/getActivityLog)

`GET /api/activity`

Returns the chronological, immutable log of merchant actions, submitted evidence statements, and settlement decisions.

```yaml
openapi: 3.2.0
servers:
  - url: https://disputecopilot.onrender.com
    description: Production Deployment (Render)
  - url: http://localhost:3000
    description: Local Development Server
paths:
  /api/activity:
    get:
      tags:
        - Audit
      summary: Retrieve Merchant Audit Trail
      description: Returns the chronological, immutable log of merchant actions,
        submitted evidence statements, and settlement decisions.
      operationId: getActivityLog
      responses:
        "200":
          description: Successfully retrieved audit log.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ActivityLogResponse"
      x-apimatic-codeSamples:
        - lang: python
          label: Python
          sources:
            Example: |-
              try:
                  response = client.audit.get_activity_log()
                  # TODO: Handle 'response' of type ActivityLogResponse
              except ApiError as e:
                  ...  # TODO: Handle 'e.error' of type RawError
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.audit.getActivityLog();
                // TODO: Handle 'response' of type ActivityLogResponse
              } catch (err) {
                // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
              }
components:
  schemas:
    ActivityLogResponse:
      type: object
      required:
        - total
        - activity
      properties:
        total:
          type: integer
          examples:
            - 3
        activity:
          type: array
          items:
            $ref: "#/components/schemas/ActivityLogEntry"
    ActivityLogEntry:
      type: object
      required:
        - id
        - timestamp
        - disputeId
        - action
        - status
        - dryRun
      properties:
        id:
          type: string
          examples:
            - act_1793994625820_32gss
        timestamp:
          type: string
          format: date-time
          examples:
            - 2026-11-06T19:50:25.820Z
        disputeId:
          type: string
          examples:
            - PP-D-1001
        action:
          type: string
          enum:
            - submit-evidence
            - accept
            - offer
          examples:
            - submit-evidence
        status:
          type: string
          enum:
            - success
            - failed
          examples:
            - success
        dryRun:
          type: boolean
          examples:
            - true
        payload:
          type: object
        response:
          type: object
        error:
          type: string
info:
  title: Dispute Copilot API
  version: 1.0.0
```