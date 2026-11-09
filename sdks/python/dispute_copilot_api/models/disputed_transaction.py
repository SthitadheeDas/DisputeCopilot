from __future__ import annotations

from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, SdkBaseModel
from .buyer import Buyer, BuyerDict
from .money import Money, MoneyDict


class DisputedTransaction(SdkBaseModel):
    seller_transaction_id: str
    buyer_transaction_id: Optional[str] = UNSET
    gross_amount: Optional[Money] = UNSET
    buyer: Optional[Buyer] = UNSET
    seller_protection_eligible: Optional[bool] = UNSET


class DisputedTransactionDict(TypedDict):
    seller_transaction_id: str
    buyer_transaction_id: NotRequired[str]
    gross_amount: NotRequired[MoneyDict]
    buyer: NotRequired[BuyerDict]
    seller_protection_eligible: NotRequired[bool]
