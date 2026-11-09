from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class ErrorResponseError(SdkBaseModel):
    error: str
    details: Optional[str] = UNSET


class ErrorResponseErrorDict(TypedDict):
    error: str
    details: NotRequired[str]
