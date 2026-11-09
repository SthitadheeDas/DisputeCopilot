from __future__ import annotations

from uuid import UUID, uuid4

from ..core import (
    ApiResult,
    AsyncRawClient,
    BaseRawResponse,
    RawClient,
    RequestOptionsOrDict,
    async_json_decoder,
    json_decoder,
    param,
    unwrap,
)
from ..errors.analyze_dispute_error import AnalyzeDisputeErrorBody, analyze_dispute_error_mapper
from ..models.analyze_response import AnalyzeResponse
from ..server.server import Server


class Ai:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = AiWithRawResponse(client, server)

    def analyze_dispute(self, id_: str, *, request_options: RequestOptionsOrDict | None = None) -> AnalyzeResponse:
        """Invokes Google Gemini to evaluate the dispute and Evidence Pack. Produces structured JSON containing
        strategic recommendation (FIGHT / ACCEPT / PARTIAL_OFFER), summary, and a factual draft defense strictly citing
        Evidence Pack fact IDs ([F1], [F2]). Validates all citations against the Evidence Pack and caches the output
        locally.

        Args:
            id_: Unique PayPal dispute identifier.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            AI analysis successfully generated and verified.

        Raises:
            ApiError: Dispute not found. Generation or citation verification failed. ``error`` is ``ErrorResponse |
                RawError``."""
        return unwrap(self._with_raw_response.analyze_dispute(id_, request_options=request_options))

    @property
    def with_raw_response(self) -> AiWithRawResponse:
        return self._with_raw_response


class AsyncAi:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncAiWithRawResponse(client, server)

    async def analyze_dispute(
        self, id_: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> AnalyzeResponse:
        """Invokes Google Gemini to evaluate the dispute and Evidence Pack. Produces structured JSON containing
        strategic recommendation (FIGHT / ACCEPT / PARTIAL_OFFER), summary, and a factual draft defense strictly citing
        Evidence Pack fact IDs ([F1], [F2]). Validates all citations against the Evidence Pack and caches the output
        locally.

        Args:
            id_: Unique PayPal dispute identifier.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            AI analysis successfully generated and verified.

        Raises:
            ApiError: Dispute not found. Generation or citation verification failed. ``error`` is ``ErrorResponse |
                RawError``."""
        return unwrap(await self._with_raw_response.analyze_dispute(id_, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncAiWithRawResponse:
        return self._with_raw_response


class AiWithRawResponse(BaseRawResponse[RawClient, Server]):
    def analyze_dispute(
        self, id_: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[AnalyzeResponse, AnalyzeDisputeErrorBody]:
        """Invokes Google Gemini to evaluate the dispute and Evidence Pack. Produces structured JSON containing
        strategic recommendation (FIGHT / ACCEPT / PARTIAL_OFFER), summary, and a factual draft defense strictly citing
        Evidence Pack fact IDs ([F1], [F2]). Validates all citations against the Evidence Pack and caches the output
        locally.

        Args:
            id_: Unique PayPal dispute identifier.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/disputes/{id}/analyze"),
            path_params=[param[str]("id", id_)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            decoder=json_decoder[AnalyzeResponse],
            error_mapper=analyze_dispute_error_mapper,
            request_options=request_options,
        )


class AsyncAiWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def analyze_dispute(
        self, id_: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[AnalyzeResponse, AnalyzeDisputeErrorBody]:
        """Invokes Google Gemini to evaluate the dispute and Evidence Pack. Produces structured JSON containing
        strategic recommendation (FIGHT / ACCEPT / PARTIAL_OFFER), summary, and a factual draft defense strictly citing
        Evidence Pack fact IDs ([F1], [F2]). Validates all citations against the Evidence Pack and caches the output
        locally.

        Args:
            id_: Unique PayPal dispute identifier.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/disputes/{id}/analyze"),
            path_params=[param[str]("id", id_)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            decoder=async_json_decoder[AnalyzeResponse],
            error_mapper=analyze_dispute_error_mapper,
            request_options=request_options,
        )
