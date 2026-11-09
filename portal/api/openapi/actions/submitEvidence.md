# Submit Evidence to PayPal (/api/openapi/actions/submitEvidence)

`POST /api/disputes/{id}/submit-evidence`

Submits merchant evidence statement to PayPal Disputes API v1 (`POST /v1/customer/disputes/{id}/provide-evidence`).
If `DRY_RUN=true`, validates and logs the payload in the audit trail without modifying live account state.


```yaml
openapi: 3.2.0
servers:
  - url: https://disputecopilot.onrender.com
    description: Production Deployment (Render)
  - url: http://localhost:3000
    description: Local Development Server
paths:
  /api/disputes/{id}/submit-evidence:
    post:
      tags:
        - Actions
      summary: Submit Evidence to PayPal
      description: >
        Submits merchant evidence statement to PayPal Disputes API v1 (`POST
        /v1/customer/disputes/{id}/provide-evidence`).

        If `DRY_RUN=true`, validates and logs the payload in the audit trail
        without modifying live account state.
      operationId: submitEvidence
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
              $ref: "#/components/schemas/SubmitEvidenceRequest"
      responses:
        "200":
          description: Evidence submitted or safely validated under DRY_RUN.
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ActionResultResponse"
        "400":
          description: Invalid request body (e.g. notes under 5 characters).
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ValidationErrorResponse"
        "500":
          description: Submission failed.
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
                  response = client.actions.submit_evidence(
                      "PP-D-1001",
                      SubmitEvidenceRequest(notes="some example string"),
                  )
                  # TODO: Handle 'response' of type ActionResultResponse
              except ApiError as e:
                  # TODO: Handle 'e.error' of type SubmitEvidenceErrorBody
                  ...
        - lang: typescript
          label: TypeScript
          sources:
            Example: >-
              try {
                const response = await client.actions.submitEvidence({
                  id: "PP-D-1001",
                  body: { notes: "some example string" },
                });
                // TODO: Handle 'response' of type ActionResultResponse
              } catch (err) {
                // TODO: Handle 'err' of type Actions.SubmitEvidenceError, discriminated with 'err.payload.kind'
              }
components:
  schemas:
    SubmitEvidenceRequest:
      type: object
      required:
        - notes
      properties:
        notes:
          type: string
          minLength: 5
          description: Formal merchant statement and factual defense notes.
          examples:
            - Carrier tracking confirms package delivered on Oct 27 signed by
              recipient. Please resolve under Seller Protection.
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