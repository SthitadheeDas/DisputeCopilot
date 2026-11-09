from __future__ import annotations

from typing import Any

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel


class ActionResultResponse(SdkBaseModel):
    success: bool
    dry_run: bool = Field(alias="dryRun")
    dispute_id: str = Field(alias="disputeId")
    activity_id: Optional[str] = Field(default=UNSET, alias="activityId")
    message: str
    submitted_payload: Optional[Any] = Field(default=UNSET, alias="submittedPayload")


class ActionResultResponseDict(TypedDict):
    success: bool
    dry_run: bool
    dispute_id: str
    activity_id: NotRequired[str]
    message: str
    submitted_payload: NotRequired[Any]
