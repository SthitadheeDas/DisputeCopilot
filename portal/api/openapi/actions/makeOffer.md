# Propose Partial Settlement Offer (/api/openapi/actions/makeOffer)

`POST /api/disputes/{id}/offer`

Submits a partial refund settlement offer to the buyer via PayPal Disputes API v1 (`POST /v1/customer/disputes/{id}/make-offer`).
If `DRY_RUN=true`, validates offer amount and records action in audit trail without live mutation.


```yaml
openapi: 3.2.0
servers:
  - url: https://disputecopilot.onrender.com
    description: Production Deployment (Render)
  - url: http://localhost:3000
    description: Local Development Server
paths:
  /api/disputes/{id}/offer:
    post:
      tags:
        - Actions
      summary: Propose Partial Settlement Offer
      description: >
        Submits a partial refund settlement offer to the buyer via PayPal
        Disputes API v1 (`POST /v1/customer/disputes/{id}/make-offer`).

        If `DRY_RUN=true`, validates offer amount and records action in audit
        trail without live mutation.
      operationId: makeOffer
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
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/MakeOfferRequest"
      responses:
        "200":
          description: Offer submitted or validated under DRY_RUN.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ActionResultResponse"
        "400":
          description: Invalid offer amount.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ValidationErrorResponse"
        "500":
          description: Offer submission failed.
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
                  response = client.actions.make_offer(
                      "PP-D-1001", MakeOfferRequest(amount=1.5)
                  )
                  # TODO: Handle 'response' of type ActionResultResponse
              except ApiError as e:
                  ...  # TODO: Handle 'e.error' of type MakeOfferErrorBody
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.actions.makeOffer({
                  id: "PP-D-1001",
                  body: { amount: 1.5 },
                });
                // TODO: Handle 'response' of type ActionResultResponse
              } catch (err) {
                // TODO: Handle 'err' of type Actions.MakeOfferError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    MakeOfferRequest:
      type: object
      required:
        - amount
      properties:
        amount:
          type: number
          minimum: 0.01
          description: Partial refund settlement amount in USD.
          examples:
            - 50
        note:
          type: string
          description: Optional note to the customer describing the settlement proposal.
          examples:
            - Goodwill partial refund offer to resolve cosmetic inquiry.
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
    ValidationErrorResponse:
      type: object
      required:
        - error
        - issues
      properties:
        error:
          type: string
          examples:
            - Invalid request body
        issues:
          type: array
          items:
            type: string
          examples:
            - - Notes must be at least 5 characters long
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