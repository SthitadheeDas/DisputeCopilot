from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class ValidationErrorResponse(SdkBaseModel):
    error: str
    issues: list[str]


class ValidationErrorResponseDict(TypedDict):
    error: str
    issues: list[str]
