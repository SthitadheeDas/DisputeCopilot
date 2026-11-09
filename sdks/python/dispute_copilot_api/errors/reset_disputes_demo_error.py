from __future__ import annotations

from dataclasses import dataclass
from typing import Final, TypeAlias

from ..core import ErrorMapper, RawError, decode_json
from ..models.error_response import ErrorResponse

ResetDisputesDemoErrorBody: TypeAlias = ErrorResponse | RawError


@dataclass(frozen=True, slots=True)
class _ResetDisputesDemoError:
    def map(self, status_code: int, content: bytes) -> ResetDisputesDemoErrorBody:
        match status_code:
            case 500:
                return decode_json[ErrorResponse](content)
            case _:
                return RawError(status_code, content)


reset_disputes_demo_error_mapper: Final[ErrorMapper[ResetDisputesDemoErrorBody]] = _ResetDisputesDemoError()
