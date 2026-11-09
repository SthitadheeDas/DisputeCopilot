from enum import Enum
from typing import Annotated, TypeAlias

from ...core import open_enum_validator


class Source(str, Enum):
    TRACKING = "tracking"
    ORDER = "order"
    REFUND_HISTORY = "refund_history"
    CUSTOMER_MESSAGES = "customer_messages"
    PAYPAL_DISPUTE = "paypal_dispute"

    __str__ = str.__str__


SourceOrStr: TypeAlias = Annotated[Source | str, open_enum_validator(Source)]
