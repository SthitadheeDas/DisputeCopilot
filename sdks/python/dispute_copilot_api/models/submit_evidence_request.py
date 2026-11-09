from __future__ import annotations

from typing_extensions import TypedDict

from ..core import SdkBaseModel


class SubmitEvidenceRequest(SdkBaseModel):
    notes: str
    """Formal merchant statement and factual defense notes."""


class SubmitEvidenceRequestDict(TypedDict):
    notes: str
