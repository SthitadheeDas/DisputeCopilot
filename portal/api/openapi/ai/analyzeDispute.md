# Generate or Refresh Gemini AI Defense Analysis (/api/openapi/ai/analyzeDispute)

`POST /api/disputes/{id}/analyze`

Invokes Google Gemini to evaluate the dispute and Evidence Pack.
Produces structured JSON containing strategic recommendation (FIGHT / ACCEPT / PARTIAL_OFFER),
summary, and a factual draft defense strictly citing Evidence Pack fact IDs ([F1], [F2]).
Validates all citations against the Evidence Pack and caches the output locally.


```yaml
openapi: 3.2.0
servers:
  - url: https://disputecopilot.onrender.com
    description: Production Deployment (Render)
  - url: http://localhost:3000
    description: Local Development Server
paths:
  /api/disputes/{id}/analyze:
    post:
      tags:
        - AI
      summary: Generate or Refresh Gemini AI Defense Analysis
      description: >
        Invokes Google Gemini to evaluate the dispute and Evidence Pack.

        Produces structured JSON containing strategic recommendation (FIGHT /
        ACCEPT / PARTIAL_OFFER),

        summary, and a factual draft defense strictly citing Evidence Pack fact
        IDs ([F1], [F2]).

        Validates all citations against the Evidence Pack and caches the output
        locally.
      operationId: analyzeDispute
      parameters:
        - name: id
          in: path
          required: true
          description: Unique PayPal dispute identifier.
          schema:
            type: string
            examples:
              - PP-D-1001
      responses:
        "200":
          description: AI analysis successfully generated and verified.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/AnalyzeResponse"
        "404":
          description: Dispute not found.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "500":
          description: Generation or citation verification failed.
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
                  response = client.ai.analyze_dispute("PP-D-1001")
                  # TODO: Handle 'response' of type AnalyzeResponse
              except ApiError as e:
                  # TODO: Handle 'e.error' of type AnalyzeDisputeErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.ai.analyzeDispute({
                  id: "PP-D-1001",
                });
                // TODO: Handle 'response' of type AnalyzeResponse
              } catch (err) {
                // TODO: Handle 'err' of type Ai.AnalyzeDisputeError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    AnalyzeResponse:
      type: object
      required:
        - success
        - disputeId
        - analysis
      properties:
        success:
          type: boolean
          examples:
            - true
        disputeId:
          type: string
          examples:
            - PP-D-1001
        analysis:
          $ref: "#/components/schemas/CachedAIAnalysis"
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
info:
  title: Dispute Copilot API
  version: 1.0.0
```