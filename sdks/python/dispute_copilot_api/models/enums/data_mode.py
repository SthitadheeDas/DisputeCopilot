from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class DataMode(str, Enum):
    SANDBOX = "sandbox"
    FIXTURE = "fixture"

    __str__ = str.__str__


DataModeOrStr: TypeAlias = Annotated[DataMode | str, open_enum_validator(DataMode)]
