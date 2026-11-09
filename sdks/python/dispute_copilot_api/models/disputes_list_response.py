from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, SdkBaseModel
from .enriched_dispute import EnrichedDispute, EnrichedDisputeDict
from .enums.data_mode import DataModeOrStr


class DisputesListResponse(SdkBaseModel):
    data_mode: DataModeOrStr = Field(alias="dataMode")
    configured_mode: Optional[str] = Field(default=UNSET, alias="configuredMode")
    dry_run: bool = Field(alias="dryRun")
    total: int
    warning: OptionalNullable[str] = UNSET
    disputes: list[EnrichedDispute]


class DisputesListResponseDict(TypedDict):
    data_mode: DataModeOrStr
    configured_mode: NotRequired[str]
    dry_run: bool
    total: int
    warning: NotRequired[str | None]
    disputes: list[EnrichedDisputeDict]
