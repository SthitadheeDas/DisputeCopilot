from __future__ import annotations

from pydantic import Field
from typing_extensions import NotRequired, TypedDict

from ..core import UNSET, Optional, RFC3339DateTime, SdkBaseModel
from .enums.data_mode import DataModeOrStr


class HealthResponse(SdkBaseModel):
    status: str
    data_mode: DataModeOrStr = Field(alias="dataMode")
    dry_run: bool = Field(alias="dryRun")
    gemini_model: Optional[str] = Field(default=UNSET, alias="geminiModel")
    has_pay_pal_credentials: Optional[bool] = Field(default=UNSET, alias="hasPayPalCredentials")
    has_gemini_key: Optional[bool] = Field(default=UNSET, alias="hasGeminiKey")
    orders_count: int = Field(alias="ordersCount")
    disputes_count: int = Field(alias="disputesCount")
    timestamp: RFC3339DateTime


class HealthResponseDict(TypedDict):
    status: str
    data_mode: DataModeOrStr
    dry_run: bool
    gemini_model: NotRequired[str]
    has_pay_pal_credentials: NotRequired[bool]
    has_gemini_key: NotRequired[bool]
    orders_count: int
    disputes_count: int
    timestamp: RFC3339DateTime
