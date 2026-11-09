from __future__ import annotations

from ..core import (
    ApiResult,
    AsyncRawClient,
    BaseRawResponse,
    RawClient,
    RawError,
    RequestOptionsOrDict,
    async_json_decoder,
    json_decoder,
    raw_error_response,
    unwrap,
)
from ..models.activity_log_response import ActivityLogResponse
from ..server.server import Server


class Audit:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = AuditWithRawResponse(client, server)

    def get_activity_log(self, *, request_options: RequestOptionsOrDict | None = None) -> ActivityLogResponse:
        """Returns the chronological, immutable log of merchant actions, submitted evidence statements, and settlement
        decisions.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Successfully retrieved audit log.

        Raises:
            ApiError: If the API responds with an error status code. ``error`` is ``RawError``."""
        return unwrap(self._with_raw_response.get_activity_log(request_options=request_options))

    @property
    def with_raw_response(self) -> AuditWithRawResponse:
        return self._with_raw_response


class AsyncAudit:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncAuditWithRawResponse(client, server)

    async def get_activity_log(self, *, request_options: RequestOptionsOrDict | None = None) -> ActivityLogResponse:
        """Returns the chronological, immutable log of merchant actions, submitted evidence statements, and settlement
        decisions.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Successfully retrieved audit log.

        Raises:
            ApiError: If the API responds with an error status code. ``error`` is ``RawError``."""
        return unwrap(await self._with_raw_response.get_activity_log(request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncAuditWithRawResponse:
        return self._with_raw_response


class AuditWithRawResponse(BaseRawResponse[RawClient, Server]):
    def get_activity_log(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ActivityLogResponse, RawError]:
        """Returns the chronological, immutable log of merchant actions, submitted evidence statements, and settlement
        decisions.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/activity"),
            decoder=json_decoder[ActivityLogResponse],
            error_mapper=raw_error_response,
            request_options=request_options,
        )


class AsyncAuditWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def get_activity_log(
        self, *, request_options: RequestOptionsOrDict | None = None
    ) -> ApiResult[ActivityLogResponse, RawError]:
        """Returns the chronological, immutable log of merchant actions, submitted evidence statements, and settlement
        decisions.

        Args:
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="GET",
            url_template=self._server.default("/api/activity"),
            decoder=async_json_decoder[ActivityLogResponse],
            error_mapper=raw_error_response,
            request_options=request_options,
        )
