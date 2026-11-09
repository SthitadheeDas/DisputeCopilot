# List All Disputes (/api/openapi/disputes/listDisputes)

`GET /api/disputes`

Retrieves all active PayPal customer disputes enriched with matched store order data,
indexed Evidence Packs, deterministic winnability scores, and live deadline calculations.
Results are sorted ascending by response deadline.


```yaml
openapi: 3.2.0
servers:
  - url: https://disputecopilot.onrender.com
    description: Production Deployment (Render)
  - url: http://localhost:3000
    description: Local Development Server
paths:
  /api/disputes:
    get:
      tags:
        - Disputes
      summary: List All Disputes
      description: >
        Retrieves all active PayPal customer disputes enriched with matched
        store order data,

        indexed Evidence Packs, deterministic winnability scores, and live
        deadline calculations.

        Results are sorted ascending by response deadline.
      operationId: listDisputes
      responses:
        "200":
          description: Successfully retrieved list of enriched disputes.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DisputesListResponse"
        "500":
          description: Internal server error while fetching disputes.
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
                  response = client.disputes.list_disputes()
                  # TODO: Handle 'response' of type DisputesListResponse
              except ApiError as e:
                  # TODO: Handle 'e.error' of type ListDisputesErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.disputes.listDisputes();
                // TODO: Handle 'response' of type DisputesListResponse
              } catch (err) {
                // TODO: Handle 'err' of type Disputes.ListDisputesError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    DisputesListResponse:
      type: object
      required:
        - dataMode
        - dryRun
        - total
        - disputes
      properties:
        dataMode:
          type: string
          enum:
            - sandbox
            - fixture
          examples:
            - sandbox
        configuredMode:
          type: string
          examples:
            - sandbox
        dryRun:
          type: boolean
          examples:
            - true
        total:
          type: integer
          examples:
            - 6
        warning:
          type:
            - string
            - "null"
          examples:
            - null
        disputes:
          type: array
          items:
            $ref: "#/components/schemas/EnrichedDispute"
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
    EnrichedDispute:
      type: object
      required:
        - dispute_id
        - create_time
        - update_time
        - dispute_amount
        - status
        - reason
        - seller_response_due_date
        - evidencePack
        - score
        - hoursRemaining
      properties:
        dispute_id:
          type: string
          examples:
            - PP-D-1001
        create_time:
          type: string
          format: date-time
          examples:
            - 2026-10-29T10:15:00Z
        update_time:
          type: string
          format: date-time
          examples:
            - 2026-10-29T10:15:00Z
        dispute_amount:
          $ref: "#/components/schemas/Money"
        status:
          type: string
          examples:
            - WAITING_FOR_SELLER_RESPONSE
        dispute_state:
          type: string
          examples:
            - REQUIRED_ACTION
        dispute_lifecycle_stage:
          type: string
          examples:
            - INQUIRY
        reason:
          type: string
          examples:
            - MERCHANDISE_OR_SERVICE_NOT_RECEIVED
        seller_response_due_date:
          type: string
          format: date-time
          examples:
            - 2026-11-08T18:00:00Z
        disputed_transactions:
          type: array
          items:
            $ref: "#/components/schemas/DisputedTransaction"
        matchedOrder:
          $ref: "#/components/schemas/StoreOrder"
        evidencePack:
          $ref: "#/components/schemas/EvidencePack"
        score:
          $ref: "#/components/schemas/ScoreResult"
        hoursRemaining:
          type: integer
          examples:
            - 36
        cachedAnalysis:
          $ref: "#/components/schemas/CachedAIAnalysis"
    Money:
      type: object
      required:
        - currency_code
        - value
      properties:
        currency_code:
          type: string
          examples:
            - USD
        value:
          type: string
          examples:
            - "349.99"
    DisputedTransaction:
      type: object
      required:
        - seller_transaction_id
      properties:
        seller_transaction_id:
          type: string
          examples:
            - REPLACE_WITH_TXN_ID_1
        buyer_transaction_id:
          type: string
          examples:
            - BUYER_TXN_1001
        gross_amount:
          $ref: "#/components/schemas/Money"
        buyer:
          type: object
          properties:
            name:
              type: string
              examples:
                - Sarah Jenkins
        seller_protection_eligible:
          type: boolean
          examples:
            - true
    StoreOrder:
      type:
        - object
        - "null"
      properties:
        orderId:
          type: string
          examples:
            - ORD-1001
        paypalTransactionId:
          type: string
          examples:
            - REPLACE_WITH_TXN_ID_1
        customerName:
          type: string
          examples:
            - Sarah Jenkins
        items:
          type: array
          items:
            type: object
            properties:
              name:
                type: string
                examples:
                  - Sony WH-1000XM5 Wireless Headphones
              description:
                type: string
                examples:
                  - Premium noise cancelling headphones
              price:
                type: number
                examples:
                  - 349.99
        amount:
          type: number
          examples:
            - 349.99
        currency:
          type: string
          examples:
            - USD
        carrier:
          type:
            - string
            - "null"
          examples:
            - UPS
        trackingNumber:
          type:
            - string
            - "null"
          examples:
            - 1Z9999999999999991
        listingDescription:
          type: string
          examples:
            - Brand new authentic Sony WH-1000XM5 Headphones in sealed box.
        returnPolicyText:
          type: string
          examples:
            - 30-day return policy for unopened items.
    EvidencePack:
      type: object
      required:
        - facts
        - missingItems
      properties:
        facts:
          type: array
          items:
            $ref: "#/components/schemas/EvidenceFact"
        missingItems:
          type: array
          items:
            type: string
          examples:
            - []
    ScoreResult:
      type: object
      required:
        - totalScore
        - band
        - disputeReason
        - breakdown
        - summary
      properties:
        totalScore:
          type: integer
          minimum: 0
          maximum: 100
          examples:
            - 100
        band:
          type: string
          enum:
            - strong
            - medium
            - weak
          examples:
            - strong
        disputeReason:
          type: string
          examples:
            - MERCHANDISE_OR_SERVICE_NOT_RECEIVED
        breakdown:
          type: array
          items:
            $ref: "#/components/schemas/RubricItemResult"
        summary:
          type: string
          examples:
            - Item Not Received claim assessed at 100/100 (STRONG defense
              strength).
    CachedAIAnalysis:
      type:
        - object
        - "null"
      required:
        - disputeId
        - summary
        - recommendation
        - draftNotes
        - citedFactIds
        - generatedAt
      properties:
        disputeId:
          type: string
          examples:
            - PP-D-1001
        summary:
          type: string
          examples:
            - Carrier tracking confirms on-time delivery with recipient
              signature. High probability of winning under Seller Protection.
        recommendation:
          type: string
          enum:
            - fight
            - accept
            - partial_offer
          examples:
            - fight
        recommendedOfferAmount:
          type:
            - number
            - "null"
          examples:
            - null
        draftNotes:
          type: string
          examples:
            - The merchant fulfilled and shipped this order promptly [F1].
              Carrier tracking confirms delivery [F3] signed by recipient [F5].
        citedFactIds:
          type: array
          items:
            type: string
          examples:
            - - F1
              - F3
              - F5
        generatedAt:
          type: string
          format: date-time
          examples:
            - 2026-11-08T04:40:00.000Z
        needsReview:
          type: boolean
          examples:
            - false
    RubricItemResult:
      type: object
      required:
        - id
        - title
        - pointsPossible
        - pointsAwarded
        - passed
        - reason
      properties:
        id:
          type: string
          examples:
            - INR_TRACKING_EXISTS
        title:
          type: string
          examples:
            - Tracking Number Provided
        pointsPossible:
          type: integer
          examples:
            - 20
        pointsAwarded:
          type: integer
          examples:
            - 20
        passed:
          type: boolean
          examples:
            - true
        reason:
          type: string
          examples:
            - "Tracking provided with UPS: 1Z9999999999999991"
    EvidenceFact:
      type: object
      required:
        - id
        - label
        - value
        - source
      properties:
        id:
          type: string
          examples:
            - F1
        label:
          type: string
          examples:
            - Tracking Number
        value:
          type: string
          examples:
            - "UPS: 1Z9999999999999991"
        source:
          type: string
          enum:
            - tracking
            - order
            - refund_history
            - customer_messages
            - paypal_dispute
          examples:
            - tracking
info:
  title: Dispute Copilot API
  version: 1.0.0
```