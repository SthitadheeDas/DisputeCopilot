from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class Buyer(SdkBaseModel):
    name: Optional[str] = UNSET


class BuyerDict(TypedDict):
    name: NotRequired[str]
