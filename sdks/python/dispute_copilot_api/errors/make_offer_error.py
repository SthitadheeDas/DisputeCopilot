from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error_response import ErrorResponse
from ..models.validation_error_response import ValidationErrorResponse

MakeOfferErrorBody: TypeAlias = ValidationErrorResponse | ErrorResponse | RawError


@dataclass(frozen=True, slots=True)
class _MakeOfferError:
    def map(self, status_code: int, content: bytes) -> MakeOfferErrorBody:
        match status_code:
            case 400:
                return decode_json[ValidationErrorResponse](content)
            case 500:
                return decode_json[ErrorResponse](content)
            case _:
                return RawError(status_code, content)


make_offer_error_mapper: Final[ErrorMapper[MakeOfferErrorBody]] = _MakeOfferError()
