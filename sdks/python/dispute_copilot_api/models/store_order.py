from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, OptionalNullable, SdkBaseModel
from .item import Item, ItemDict


class StoreOrder(SdkBaseModel):
    order_id: Optional[str] = Field(default=UNSET, alias="orderId")
    paypal_transaction_id: Optional[str] = Field(default=UNSET, alias="paypalTransactionId")
    customer_name: Optional[str] = Field(default=UNSET, alias="customerName")
    items: Optional[list[Item]] = UNSET
    amount: Optional[float] = UNSET
    currency: Optional[str] = UNSET
    carrier: OptionalNullable[str] = UNSET
    tracking_number: OptionalNullable[str] = Field(default=UNSET, alias="trackingNumber")
    listing_description: Optional[str] = Field(default=UNSET, alias="listingDescription")
    return_policy_text: Optional[str] = Field(default=UNSET, alias="returnPolicyText")


class StoreOrderDict(TypedDict):
    order_id: NotRequired[str]
    paypal_transaction_id: NotRequired[str]
    customer_name: NotRequired[str]
    items: NotRequired[list[ItemDict]]
    amount: NotRequired[float]
    currency: NotRequired[str]
    carrier: NotRequired[str | None]
    tracking_number: NotRequired[str | None]
    listing_description: NotRequired[str]
    return_policy_text: NotRequired[str]
