from __future__ import annotations

from uuid import UUID, uuid4

from ..core import (
    ApiResult,
    AsyncRawClient,
    BaseRawResponse,
    RawClient,
    RequestOptionsOrDict,
    async_json_decoder,
    json_body,
    json_decoder,
    param,
    unwrap,
)
from ..errors.accept_claim_error import AcceptClaimErrorBody, accept_claim_error_mapper
from ..errors.make_offer_error import MakeOfferErrorBody, make_offer_error_mapper
from ..errors.submit_evidence_error import SubmitEvidenceErrorBody, submit_evidence_error_mapper
from ..models.accept_claim_request import AcceptClaimRequest, AcceptClaimRequestDict
from ..models.action_result_response import ActionResultResponse
from ..models.make_offer_request import MakeOfferRequest, MakeOfferRequestDict
from ..models.submit_evidence_request import SubmitEvidenceRequest, SubmitEvidenceRequestDict
from ..server.server import Server


class Actions:
    def __init__(self, client: RawClient, server: Server) -> None:
        self._with_raw_response = ActionsWithRawResponse(client, server)

    def accept_claim(
        self,
        id_: str,
        *,
        body: AcceptClaimRequest | AcceptClaimRequestDict | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ActionResultResponse:
        """Concedes liability and accepts the customer claim via PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/accept-claim``). Authorizes full refund to buyer. If ``DRY_RUN=true``, validates and
        records action without sending network mutation.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Claim accepted or validated under DRY_RUN.

        Raises:
            ApiError: Accept claim action failed. ``error`` is ``ErrorResponse | RawError``."""
        return unwrap(self._with_raw_response.accept_claim(id_, body=body, request_options=request_options))

    def make_offer(
        self,
        id_: str,
        body: MakeOfferRequest | MakeOfferRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ActionResultResponse:
        """Submits a partial refund settlement offer to the buyer via PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/make-offer``). If ``DRY_RUN=true``, validates offer amount and records action in
        audit trail without live mutation.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Offer submitted or validated under DRY_RUN.

        Raises:
            ApiError: Invalid offer amount. Offer submission failed. ``error`` is ``ValidationErrorResponse |
                ErrorResponse | RawError``."""
        return unwrap(self._with_raw_response.make_offer(id_, body, request_options=request_options))

    def submit_evidence(
        self,
        id_: str,
        body: SubmitEvidenceRequest | SubmitEvidenceRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ActionResultResponse:
        """Submits merchant evidence statement to PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/provide-evidence``). If ``DRY_RUN=true``, validates and logs the payload in the audit
        trail without modifying live account state.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Evidence submitted or safely validated under DRY_RUN.

        Raises:
            ApiError: Invalid request body (e.g. notes under 5 characters). Submission failed. ``error`` is
                ``ValidationErrorResponse | ErrorResponse | RawError``."""
        return unwrap(self._with_raw_response.submit_evidence(id_, body, request_options=request_options))

    @property
    def with_raw_response(self) -> ActionsWithRawResponse:
        return self._with_raw_response


class AsyncActions:
    def __init__(self, client: AsyncRawClient, server: Server) -> None:
        self._with_raw_response = AsyncActionsWithRawResponse(client, server)

    async def accept_claim(
        self,
        id_: str,
        *,
        body: AcceptClaimRequest | AcceptClaimRequestDict | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ActionResultResponse:
        """Concedes liability and accepts the customer claim via PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/accept-claim``). Authorizes full refund to buyer. If ``DRY_RUN=true``, validates and
        records action without sending network mutation.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Claim accepted or validated under DRY_RUN.

        Raises:
            ApiError: Accept claim action failed. ``error`` is ``ErrorResponse | RawError``."""
        return unwrap(await self._with_raw_response.accept_claim(id_, body=body, request_options=request_options))

    async def make_offer(
        self,
        id_: str,
        body: MakeOfferRequest | MakeOfferRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ActionResultResponse:
        """Submits a partial refund settlement offer to the buyer via PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/make-offer``). If ``DRY_RUN=true``, validates offer amount and records action in
        audit trail without live mutation.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Offer submitted or validated under DRY_RUN.

        Raises:
            ApiError: Invalid offer amount. Offer submission failed. ``error`` is ``ValidationErrorResponse |
                ErrorResponse | RawError``."""
        return unwrap(await self._with_raw_response.make_offer(id_, body, request_options=request_options))

    async def submit_evidence(
        self,
        id_: str,
        body: SubmitEvidenceRequest | SubmitEvidenceRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ActionResultResponse:
        """Submits merchant evidence statement to PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/provide-evidence``). If ``DRY_RUN=true``, validates and logs the payload in the audit
        trail without modifying live account state.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            Evidence submitted or safely validated under DRY_RUN.

        Raises:
            ApiError: Invalid request body (e.g. notes under 5 characters). Submission failed. ``error`` is
                ``ValidationErrorResponse | ErrorResponse | RawError``."""
        return unwrap(await self._with_raw_response.submit_evidence(id_, body, request_options=request_options))

    @property
    def with_raw_response(self) -> AsyncActionsWithRawResponse:
        return self._with_raw_response


class ActionsWithRawResponse(BaseRawResponse[RawClient, Server]):
    def accept_claim(
        self,
        id_: str,
        *,
        body: AcceptClaimRequest | AcceptClaimRequestDict | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ActionResultResponse, AcceptClaimErrorBody]:
        """Concedes liability and accepts the customer claim via PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/accept-claim``). Authorizes full refund to buyer. If ``DRY_RUN=true``, validates and
        records action without sending network mutation.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/disputes/{id}/accept"),
            path_params=[param[str]("id", id_)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[AcceptClaimRequest | AcceptClaimRequestDict | None](body),
            decoder=json_decoder[ActionResultResponse],
            error_mapper=accept_claim_error_mapper,
            request_options=request_options,
        )

    def make_offer(
        self,
        id_: str,
        body: MakeOfferRequest | MakeOfferRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ActionResultResponse, MakeOfferErrorBody]:
        """Submits a partial refund settlement offer to the buyer via PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/make-offer``). If ``DRY_RUN=true``, validates offer amount and records action in
        audit trail without live mutation.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/disputes/{id}/offer"),
            path_params=[param[str]("id", id_)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[MakeOfferRequest | MakeOfferRequestDict](body),
            decoder=json_decoder[ActionResultResponse],
            error_mapper=make_offer_error_mapper,
            request_options=request_options,
        )

    def submit_evidence(
        self,
        id_: str,
        body: SubmitEvidenceRequest | SubmitEvidenceRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ActionResultResponse, SubmitEvidenceErrorBody]:
        """Submits merchant evidence statement to PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/provide-evidence``). If ``DRY_RUN=true``, validates and logs the payload in the audit
        trail without modifying live account state.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/disputes/{id}/submit-evidence"),
            path_params=[param[str]("id", id_)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[SubmitEvidenceRequest | SubmitEvidenceRequestDict](body),
            decoder=json_decoder[ActionResultResponse],
            error_mapper=submit_evidence_error_mapper,
            request_options=request_options,
        )


class AsyncActionsWithRawResponse(BaseRawResponse[AsyncRawClient, Server]):
    async def accept_claim(
        self,
        id_: str,
        *,
        body: AcceptClaimRequest | AcceptClaimRequestDict | None = None,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ActionResultResponse, AcceptClaimErrorBody]:
        """Concedes liability and accepts the customer claim via PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/accept-claim``). Authorizes full refund to buyer. If ``DRY_RUN=true``, validates and
        records action without sending network mutation.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/disputes/{id}/accept"),
            path_params=[param[str]("id", id_)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[AcceptClaimRequest | AcceptClaimRequestDict | None](body),
            decoder=async_json_decoder[ActionResultResponse],
            error_mapper=accept_claim_error_mapper,
            request_options=request_options,
        )

    async def make_offer(
        self,
        id_: str,
        body: MakeOfferRequest | MakeOfferRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ActionResultResponse, MakeOfferErrorBody]:
        """Submits a partial refund settlement offer to the buyer via PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/make-offer``). If ``DRY_RUN=true``, validates offer amount and records action in
        audit trail without live mutation.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/disputes/{id}/offer"),
            path_params=[param[str]("id", id_)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[MakeOfferRequest | MakeOfferRequestDict](body),
            decoder=async_json_decoder[ActionResultResponse],
            error_mapper=make_offer_error_mapper,
            request_options=request_options,
        )

    async def submit_evidence(
        self,
        id_: str,
        body: SubmitEvidenceRequest | SubmitEvidenceRequestDict,
        *,
        request_options: RequestOptionsOrDict | None = None,
    ) -> ApiResult[ActionResultResponse, SubmitEvidenceErrorBody]:
        """Submits merchant evidence statement to PayPal Disputes API v1 (``POST
        /v1/customer/disputes/{id}/provide-evidence``). If ``DRY_RUN=true``, validates and logs the payload in the audit
        trail without modifying live account state.

        Args:
            id_: Unique PayPal dispute identifier.
            body: The request body.
            request_options: Per-call overrides for this one request, such as a timeout, extra headers, or its retry
                count and statuses.

        Returns:
            An ``ApiResult`` holding the deserialized response or the error body."""
        return await self._client.execute(
            http_method="POST",
            url_template=self._server.default("/api/disputes/{id}/submit-evidence"),
            path_params=[param[str]("id", id_)],
            headers=[param[UUID]("Idempotency-Key", uuid4())],
            body=json_body[SubmitEvidenceRequest | SubmitEvidenceRequestDict](body),
            decoder=async_json_decoder[ActionResultResponse],
            error_mapper=submit_evidence_error_mapper,
            request_options=request_options,
        )
