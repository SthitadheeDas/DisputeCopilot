from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .enums.source import SourceOrStr


class EvidenceFact(SdkBaseModel):
    id: str
    label: str
    value: str
    source: SourceOrStr


class EvidenceFactDict(TypedDict):
    id: str
    label: str
    value: str
    source: SourceOrStr
