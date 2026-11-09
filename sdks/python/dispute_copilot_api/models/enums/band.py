from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Band(str, Enum):
    STRONG = "strong"
    MEDIUM = "medium"
    WEAK = "weak"

    __str__ = str.__str__


BandOrStr: TypeAlias = Annotated[Band | str, open_enum_validator(Band)]
