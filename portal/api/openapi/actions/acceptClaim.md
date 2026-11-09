# Accept Dispute Claim (/api/openapi/actions/acceptClaim)

`POST /api/disputes/{id}/accept`

Concedes liability and accepts the customer claim via PayPal Disputes API v1 (`POST /v1/customer/disputes/{id}/accept-claim`).
Authorizes full refund to buyer. If `DRY_RUN=true`, validates and records action without sending network mutation.


```yaml
openapi: 3.2.0
servers:
  - url: https://disputecopilot.onrender.com
    description: Production Deployment (Render)
  - url: http://localhost:3000
    description: Local Development Server
paths:
  /api/disputes/{id}/accept:
    post:
      tags:
        - Actions
      summary: Accept Dispute Claim
      description: >
        Concedes liability and accepts the customer claim via PayPal Disputes
        API v1 (`POST /v1/customer/disputes/{id}/accept-claim`).

        Authorizes full refund to buyer. If `DRY_RUN=true`, validates and
        records action without sending network mutation.
      operationId: acceptClaim
      parameters:
        - name: id
          in: path
          required: true
          description: Unique PayPal dispute identifier.
          schema:
            type: string
            examples:
              - PP-D-1001
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/AcceptClaimRequest"
      responses:
        "200":
          description: Claim accepted or validated under DRY_RUN.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ActionResultResponse"
        "500":
          description: Accept claim action failed.
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
                  response = client.actions.accept_claim("PP-D-1001")
                  # TODO: Handle 'response' of type ActionResultResponse
              except ApiError as e:
                  # TODO: Handle 'e.error' of type AcceptClaimErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.actions.acceptClaim({
                  id: "PP-D-1001",
                });
                // TODO: Handle 'response' of type ActionResultResponse
              } catch (err) {
                // TODO: Handle 'err' of type Actions.AcceptClaimError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    AcceptClaimRequest:
      type: object
      properties:
        note:
          type: string
          description: Optional explanation for accepting claim and issuing full refund.
          examples:
            - Merchant accepted customer claim.
    ActionResultResponse:
      type: object
      required:
        - success
        - dryRun
        - disputeId
        - message
      properties:
        success:
          type: boolean
          examples:
            - true
        dryRun:
          type: boolean
          examples:
            - true
        disputeId:
          type: string
          examples:
            - PP-D-1001
        activityId:
          type: string
          examples:
            - act_1793995132413_efkwi
        message:
          type: string
          examples:
            - "DRY_RUN mode active: Evidence payload validated without sending
              to PayPal."
        submittedPayload:
          type: object
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