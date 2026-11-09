from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .activity_log_entry import ActivityLogEntry, ActivityLogEntryDict


class ActivityLogResponse(SdkBaseModel):
    total: int
    activity: list[ActivityLogEntry]


class ActivityLogResponseDict(TypedDict):
    total: int
    activity: list[ActivityLogEntryDict]
