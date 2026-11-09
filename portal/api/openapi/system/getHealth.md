# Health & Configuration Status (/api/openapi/system/getHealth)

`GET /api/health`

Returns service operational status, active data mode (sandbox vs fixture), dry run safety flag, and order/dispute statistics.

```yaml
openapi: 3.2.0
servers:
  - url: https://disputecopilot.onrender.com
    description: Production Deployment (Render)
  - url: http://localhost:3000
    description: Local Development Server
paths:
  /api/health:
    get:
      tags:
        - System
      summary: Health & Configuration Status
      description: Returns service operational status, active data mode (sandbox vs
        fixture), dry run safety flag, and order/dispute statistics.
      operationId: getHealth
      responses:
        "200":
          description: Service is healthy and configured.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/HealthResponse"
              examples:
                default:
                  value:
                    status: ok
                    dataMode: sandbox
                    dryRun: true
                    geminiModel: gemini-3.8-flash
                    hasPayPalCredentials: true
                    hasGeminiKey: true
                    ordersCount: 6
                    disputesCount: 6
                    timestamp: 2026-11-08T04:38:00.000Z
      x-apimatic-codeSamples:
        - lang: python
          label: Python
          sources:
            Example: |-
              try:
                  response = client.system.get_health()
                  # TODO: Handle 'response' of type HealthResponse
              except ApiError as e:
                  ...  # TODO: Handle 'e.error' of type RawError
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.system.getHealth();
                // TODO: Handle 'response' of type HealthResponse
              } catch (err) {
                // TODO: Handle 'err' of type ApiError, where 'err.payload' is always the Undeclared arm
              }
components:
  schemas:
    HealthResponse:
      type: object
      required:
        - status
        - dataMode
        - dryRun
        - ordersCount
        - disputesCount
        - timestamp
      properties:
        status:
          type: string
          examples:
            - ok
        dataMode:
          type: string
          enum:
            - sandbox
            - fixture
          examples:
            - sandbox
        dryRun:
          type: boolean
          examples:
            - true
        geminiModel:
          type: string
          examples:
            - gemini-3.8-flash
        hasPayPalCredentials:
          type: boolean
          examples:
            - true
        hasGeminiKey:
          type: boolean
          examples:
            - true
        ordersCount:
          type: integer
          examples:
            - 6
        disputesCount:
          type: integer
          examples:
            - 6
        timestamp:
          type: string
          format: date-time
          examples:
            - 2026-11-08T04:38:00.000Z
info:
  title: Dispute Copilot API
  version: 1.0.0
```