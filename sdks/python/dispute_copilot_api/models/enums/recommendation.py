from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Recommendation(str, Enum):
    FIGHT = "fight"
    ACCEPT = "accept"
    PARTIAL_OFFER = "partial_offer"

    __str__ = str.__str__


RecommendationOrStr: TypeAlias = Annotated[Recommendation | str, open_enum_validator(Recommendation)]
