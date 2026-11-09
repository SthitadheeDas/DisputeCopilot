from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .enums.band import BandOrStr
from .rubric_item_result import RubricItemResult, RubricItemResultDict


class ScoreResult(SdkBaseModel):
    total_score: int = Field(alias="totalScore")
    band: BandOrStr
    dispute_reason: str = Field(alias="disputeReason")
    breakdown: list[RubricItemResult]
    summary: str


class ScoreResultDict(TypedDict):
    total_score: int
    band: BandOrStr
    dispute_reason: str
    breakdown: list[RubricItemResultDict]
    summary: str
