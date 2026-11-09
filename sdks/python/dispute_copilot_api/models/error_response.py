from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class ErrorResponse(SdkBaseModel):
    error: str
    details: Optional[str] = UNSET


class ErrorResponseDict(TypedDict):
    error: str
    details: NotRequired[str]
