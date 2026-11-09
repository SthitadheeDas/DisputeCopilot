# Reset Demo Dispute Database (/api/openapi/disputes/resetDisputesDemo)

`POST /api/disputes/reset`

Resets mock fixture disputes back to their initial active state (6 active disputes, clearing test concessions/refunds).

```yaml
openapi: 3.2.0
servers:
  - url: https://disputecopilot.onrender.com
    description: Production Deployment (Render)
  - url: http://localhost:3000
    description: Local Development Server
paths:
  /api/disputes/reset:
    post:
      tags:
        - Disputes
      summary: Reset Demo Dispute Database
      description: Resets mock fixture disputes back to their initial active state (6
        active disputes, clearing test concessions/refunds).
      operationId: resetDisputesDemo
      responses:
        "200":
          description: Mock dispute database successfully reset.
          content:
            application/json:
              schema:
                type: object
                properties:
                  success:
                    type: boolean
                    examples:
                      - true
                  message:
                    type: string
                    examples:
                      - Demo disputes and store data have been reset to active
                        state.
                  total:
                    type: integer
                    examples:
                      - 6
        "500":
          description: Failed to reset demo data.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
      x-apimatic-codeSamples:
        - lang: python
          label: Python
          sources:
            Example: |-
              try:
                  response = client.disputes.reset_disputes_demo()
                  # TODO: Handle 'response' of type
                  # ApiDisputesResetResponse
              except ApiError as e:
                  # TODO: Handle 'e.error' of type
                  # ResetDisputesDemoErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response =
                  await client.disputes.resetDisputesDemo();
                // TODO: Handle 'response' of type ApiDisputesResetResponse
              } catch (err) {
                // TODO: Handle 'err' of type Disputes.ResetDisputesDemoError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    ErrorResponse:
      type: object
      required:
        - error
      properties:
        error:
          type: string
          examples:
            - Failed to retrieve dispute details
        details:
          type: string
          examples:
            - Detailed error message
info:
  title: Dispute Copilot API
  version: 1.0.0
```