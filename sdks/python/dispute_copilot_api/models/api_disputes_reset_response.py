from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class ApiDisputesResetResponse(SdkBaseModel):
    success: Optional[bool] = UNSET
    message: Optional[str] = UNSET
    total: Optional[int] = UNSET


class ApiDisputesResetResponseDict(TypedDict):
    success: NotRequired[bool]
    message: NotRequired[str]
    total: NotRequired[int]
