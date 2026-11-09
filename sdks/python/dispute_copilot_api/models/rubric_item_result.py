from __future__ import annotations

from pydantic import Field
from typing_extensions import TypedDict

from ..core import SdkBaseModel


class RubricItemResult(SdkBaseModel):
    id: str
    title: str
    points_possible: int = Field(alias="pointsPossible")
    points_awarded: int = Field(alias="pointsAwarded")
    passed: bool
    reason: str


class RubricItemResultDict(TypedDict):
    id: str
    title: str
    points_possible: int
    points_awarded: int
    passed: bool
    reason: str
