from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel
from .cached_ai_analysis import CachedAiAnalysis, CachedAiAnalysisDict


class AnalyzeResponse(SdkBaseModel):
    success: bool
    dispute_id: str = Field(alias="disputeId")
    analysis: CachedAiAnalysis | None


class AnalyzeResponseDict(TypedDict):
    success: bool
    dispute_id: str
    analysis: CachedAiAnalysisDict | None
