from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field, field_validator

Service = Literal['airtime', 'data', 'electricity', 'cable', 'education', 'other']


class OrderCreate(BaseModel):
    service: Service
    customer_reference: str = Field(min_length=5, max_length=60, pattern=r'^[a-zA-Z0-9+._ -]+$')
    amount: Decimal = Field(ge=Decimal('100'), le=Decimal('1000000'), max_digits=9, decimal_places=2)

    @field_validator('customer_reference')
    @classmethod
    def strip_reference(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 5:
            raise ValueError('Customer reference must be at least five characters')
        return value


class OrderOut(BaseModel):
    id: str
    reference: str
    service: Service
    customer_reference: str
    amount_kobo: int
    status: str
    model_config = {'from_attributes': True}
