from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class ValidationErrorResponseError(SdkBaseModel):
    error: str
    issues: list[str]


class ValidationErrorResponseErrorDict(TypedDict):
    error: str
    issues: list[str]
