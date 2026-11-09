from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Action(str, Enum):
    SUBMIT_EVIDENCE = "submit-evidence"
    ACCEPT = "accept"
    OFFER = "offer"

    __str__ = str.__str__


ActionOrStr: TypeAlias = Annotated[Action | str, open_enum_validator(Action)]
