from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error_response import ErrorResponse

AcceptClaimErrorBody: TypeAlias = ErrorResponse | RawError


@dataclass(frozen=True, slots=True)
class _AcceptClaimError:
    def map(self, status_code: int, content: bytes) -> AcceptClaimErrorBody:
        match status_code:
            case 500:
                return decode_json[ErrorResponse](content)
            case _:
                return RawError(status_code, content)


accept_claim_error_mapper: Final[ErrorMapper[AcceptClaimErrorBody]] = _AcceptClaimError()
