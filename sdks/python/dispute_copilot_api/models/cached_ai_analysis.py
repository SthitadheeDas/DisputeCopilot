from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, RFC3339DateTime, SdkBaseModel
from .enums.recommendation import RecommendationOrStr


class CachedAiAnalysis(SdkBaseModel):
    dispute_id: str = Field(alias="disputeId")
    summary: str
    recommendation: RecommendationOrStr
    recommended_offer_amount: OptionalNullable[float] = Field(default=UNSET, alias="recommendedOfferAmount")
    draft_notes: str = Field(alias="draftNotes")
    cited_fact_ids: list[str] = Field(alias="citedFactIds")
    generated_at: RFC3339DateTime = Field(alias="generatedAt")
    needs_review: Optional[bool] = Field(default=UNSET, alias="needsReview")


class CachedAiAnalysisDict(TypedDict):
    dispute_id: str
    summary: str
    recommendation: RecommendationOrStr
    recommended_offer_amount: NotRequired[float | None]
    draft_notes: str
    cited_fact_ids: list[str]
    generated_at: RFC3339DateTime
    needs_review: NotRequired[bool]
