from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .evidence_fact import EvidenceFact, EvidenceFactDict


class EvidencePack(SdkBaseModel):
    facts: list[EvidenceFact]
    missing_items: list[str] = Field(alias="missingItems")


class EvidencePackDict(TypedDict):
    facts: list[EvidenceFactDict]
    missing_items: list[str]
