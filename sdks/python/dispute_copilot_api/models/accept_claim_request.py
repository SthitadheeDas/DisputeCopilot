from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class AcceptClaimRequest(SdkBaseModel):
    note: Optional[str] = UNSET
    """Optional explanation for accepting claim and issuing full refund."""


class AcceptClaimRequestDict(TypedDict):
    note: NotRequired[str]
