from __future__ import annotations

from typing import Any

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, RFC3339DateTime, SdkBaseModel
from .enums.action import ActionOrStr
from .enums.status import StatusOrStr


class ActivityLogEntry(SdkBaseModel):
    id: str
    timestamp: RFC3339DateTime
    dispute_id: str = Field(alias="disputeId")
    action: ActionOrStr
    status: StatusOrStr
    dry_run: bool = Field(alias="dryRun")
    payload: Optional[Any] = UNSET
    response: Optional[Any] = UNSET
    error: Optional[str] = UNSET


class ActivityLogEntryDict(TypedDict):
    id: str
    timestamp: RFC3339DateTime
    dispute_id: str
    action: ActionOrStr
    status: StatusOrStr
    dry_run: bool
    payload: NotRequired[Any]
    response: NotRequired[Any]
    error: NotRequired[str]
