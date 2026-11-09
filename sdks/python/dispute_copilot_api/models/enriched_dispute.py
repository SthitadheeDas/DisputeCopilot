from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, RFC3339DateTime, SdkBaseModel
from .cached_ai_analysis import CachedAiAnalysis, CachedAiAnalysisDict
from .disputed_transaction import DisputedTransaction, DisputedTransactionDict
from .evidence_pack import EvidencePack, EvidencePackDict
from .money import Money, MoneyDict
from .score_result import ScoreResult, ScoreResultDict
from .store_order import StoreOrder, StoreOrderDict


class EnrichedDispute(SdkBaseModel):
    dispute_id: str
    create_time: RFC3339DateTime
    update_time: RFC3339DateTime
    dispute_amount: Money
    status: str
    dispute_state: Optional[str] = UNSET
    dispute_lifecycle_stage: Optional[str] = UNSET
    reason: str
    seller_response_due_date: RFC3339DateTime
    disputed_transactions: Optional[list[DisputedTransaction]] = UNSET
    matched_order: OptionalNullable[StoreOrder] = Field(default=UNSET, alias="matchedOrder")
    evidence_pack: EvidencePack = Field(alias="evidencePack")
    score: ScoreResult
    hours_remaining: int = Field(alias="hoursRemaining")
    cached_analysis: OptionalNullable[CachedAiAnalysis] = Field(default=UNSET, alias="cachedAnalysis")


class EnrichedDisputeDict(TypedDict):
    dispute_id: str
    create_time: RFC3339DateTime
    update_time: RFC3339DateTime
    dispute_amount: MoneyDict
    status: str
    dispute_state: NotRequired[str]
    dispute_lifecycle_stage: NotRequired[str]
    reason: str
    seller_response_due_date: RFC3339DateTime
    disputed_transactions: NotRequired[list[DisputedTransactionDict]]
    matched_order: NotRequired[StoreOrderDict | None]
    evidence_pack: EvidencePackDict
    score: ScoreResultDict
    hours_remaining: int
    cached_analysis: NotRequired[CachedAiAnalysisDict | None]
