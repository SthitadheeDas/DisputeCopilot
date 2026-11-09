from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class MakeOfferRequest(SdkBaseModel):
    amount: float
    """Partial refund settlement amount in USD."""

    note: Optional[str] = UNSET
    """Optional note to the customer describing the settlement proposal."""


class MakeOfferRequestDict(TypedDict):
    amount: float
    note: NotRequired[str]
