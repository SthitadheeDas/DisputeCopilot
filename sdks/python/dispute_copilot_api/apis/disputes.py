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
from ..errors.get_dispute_by_id_error import GetDisputeByIdErrorBody, get_dispute_by_id_error_mapper
from ..errors.list_disputes_error import ListDisputesErrorBody, list_disputes_error_mapper
from ..errors.reset_disputes_demo_error import ResetDisputesDemoErrorBody, reset_disputes_demo_error_mapper
from ..models.api_disputes_reset_response import ApiDisputesResetResponse
from ..models.disputes_list_response import DisputesListResponse
from ..models.enriched_dispute import EnrichedDispute
from ..server.server import Server


class Disputes:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = DisputesWithRawResponse(client, server)

    def get_dispute_by_id(self, id_: str, *, request_options: RequestOptionsOrDict | None = None) -> EnrichedDispute:
        """Fetches full details for a specific dispute, including its store order match, evidence pack facts, score
        breakdown, and cached AI analysis.

        Args:
            id_: Unique PayPal dispute identifier (e.g. PP-D-1001).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Dispute details found and returned.

        Raises:
            ApiError: Dispute not found. Failed to retrieve dispute details. ``error`` is ``ErrorResponse |
                RawError``."""
        return unwrap(self._with_raw_response.get_dispute_by_id(id_, request_options=request_options))

    def list_disputes(self, *, request_options: RequestOptionsOrDict | None = None) -> DisputesListResponse:
        """Retrieves all active PayPal customer disputes enriched with matched store order data, indexed Evidence Packs,
        deterministic winnability scores, and live deadline calculations. Results are sorted ascending by response
        deadline.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Successfully retrieved list of enriched disputes.

        Raises:
            ApiError: Internal server error while fetching disputes. ``error`` is ``ErrorResponse | RawError``."""
        return unwrap(self._with_raw_response.list_disputes(request_options=request_options))

    def reset_disputes_demo(self, *, request_options: RequestOptionsOrDict | None = None) -> ApiDisputesResetResponse:
        """Resets mock fixture disputes back to their initial active state (6 active disputes, clearing test
        concessions/refunds).

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Mock dispute database successfully reset.

        Raises:
            ApiError: Failed to reset demo data. ``error`` is ``ErrorResponse | RawError``."""
        return unwrap(self._with_raw_response.reset_disputes_demo(request_options=request_options))

    @property
    def with_raw_response(self) -> DisputesWithRawResponse:
        return self._with_raw_response


class AsyncDisputes:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncDisputesWithRawResponse(client, server)

    async def get_dispute_by_id(
        self, id_: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> EnrichedDispute:
        """Fetches full details for a specific dispute, including its store order match, evidence pack facts, score
        breakdown, and cached AI analysis.

        Args:
            id_: Unique PayPal dispute identifier (e.g. PP-D-1001).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Dispute details found and returned.

        Raises:
            ApiError: Dispute not found. Failed to retrieve dispute details. ``error`` is ``ErrorResponse |
                RawError``."""
        return unwrap(await self._with_raw_response.get_dispute_by_id(id_, request_options=request_options))

    async def list_disputes(self, *, request_options: RequestOptionsOrDict | None = None) -> DisputesListResponse:
        """Retrieves all active PayPal customer disputes enriched with matched store order data, indexed Evidence Packs,
        deterministic winnability scores, and live deadline calculations. Results are sorted ascending by response
        deadline.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Successfully retrieved list of enriched disputes.

        Raises:
            ApiError: Internal server error while fetching disputes. ``error`` is ``ErrorResponse | RawError``."""
        return unwrap(await self._with_raw_response.list_disputes(request_options=request_options))

    async def reset_disputes_demo(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiDisputesResetResponse:
        """Resets mock fixture disputes back to their initial active state (6 active disputes, clearing test
        concessions/refunds).

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Mock dispute database successfully reset.

        Raises:
            ApiError: Failed to reset demo data. ``error`` is ``ErrorResponse | RawError``."""
        return unwrap(await self._with_raw_response.reset_disputes_demo(request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncDisputesWithRawResponse:
        return self._with_raw_response


class DisputesWithRawResponse(BaseRawResponse[RawClient, Server]):
    def get_dispute_by_id(
        self, id_: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[EnrichedDispute, GetDisputeByIdErrorBody]:
        """Fetches full details for a specific dispute, including its store order match, evidence pack facts, score
        breakdown, and cached AI analysis.

        Args:
            id_: Unique PayPal dispute identifier (e.g. PP-D-1001).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/disputes/{id}"),
            path_params=[param[str]("id", id_)],
            decoder=json_decoder[EnrichedDispute],
            error_mapper=get_dispute_by_id_error_mapper,
            request_options=request_options,
        )

    def list_disputes(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[DisputesListResponse, ListDisputesErrorBody]:
        """Retrieves all active PayPal customer disputes enriched with matched store order data, indexed Evidence Packs,
        deterministic winnability scores, and live deadline calculations. Results are sorted ascending by response
        deadline.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/disputes"),
            decoder=json_decoder[DisputesListResponse],
            error_mapper=list_disputes_error_mapper,
            request_options=request_options,
        )

    def reset_disputes_demo(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ApiDisputesResetResponse, ResetDisputesDemoErrorBody]:
        """Resets mock fixture disputes back to their initial active state (6 active disputes, clearing test
        concessions/refunds).

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/disputes/reset"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            decoder=json_decoder[ApiDisputesResetResponse],
            error_mapper=reset_disputes_demo_error_mapper,
            request_options=request_options,
        )


class AsyncDisputesWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def get_dispute_by_id(
        self, id_: str, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[EnrichedDispute, GetDisputeByIdErrorBody]:
        """Fetches full details for a specific dispute, including its store order match, evidence pack facts, score
        breakdown, and cached AI analysis.

        Args:
            id_: Unique PayPal dispute identifier (e.g. PP-D-1001).
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/disputes/{id}"),
            path_params=[param[str]("id", id_)],
            decoder=async_json_decoder[EnrichedDispute],
            error_mapper=get_dispute_by_id_error_mapper,
            request_options=request_options,
        )

    async def list_disputes(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[DisputesListResponse, ListDisputesErrorBody]:
        """Retrieves all active PayPal customer disputes enriched with matched store order data, indexed Evidence Packs,
        deterministic winnability scores, and live deadline calculations. Results are sorted ascending by response
        deadline.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/disputes"),
            decoder=async_json_decoder[DisputesListResponse],
            error_mapper=list_disputes_error_mapper,
            request_options=request_options,
        )

    async def reset_disputes_demo(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ApiDisputesResetResponse, ResetDisputesDemoErrorBody]:
        """Resets mock fixture disputes back to their initial active state (6 active disputes, clearing test
        concessions/refunds).

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/disputes/reset"),
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            decoder=async_json_decoder[ApiDisputesResetResponse],
            error_mapper=reset_disputes_demo_error_mapper,
            request_options=request_options,
        )
