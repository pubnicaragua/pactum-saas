from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AccountReceivableCreate(BaseModel):
    client_id: str
    client_name: str
    amount: float
    due_date: str
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    is_partner: bool = False
    partner_percentage: Optional[float] = None  # Percentage they are covering
    status: str = "pending"  # pending, paid, overdue, partial

class AccountReceivableUpdate(BaseModel):
    amount: Optional[float] = None
    due_date: Optional[str] = None
    invoice_number: Optional[str] = None
    description: Optional[str] = None
    is_partner: Optional[bool] = None
    partner_percentage: Optional[float] = None
    status: Optional[str] = None
    paid_amount: Optional[float] = None
    paid_date: Optional[str] = None
    notes: Optional[str] = None
