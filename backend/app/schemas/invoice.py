"""
Pydantic schemas for Invoice and Invoice Items
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal


class InvoiceItemBase(BaseModel):
    """Base invoice item schema"""
    product_id: Optional[UUID] = None
    product_name: str
    description: Optional[str] = None
    quantity: Decimal = Decimal("1")
    unit: str = "piece"
    unit_price: Decimal
    tax_rate: Decimal = Decimal("0")
    discount_rate: Decimal = Decimal("0")


class InvoiceItemCreate(InvoiceItemBase):
    """Schema for creating a new invoice item"""
    pass


class InvoiceItemResponse(InvoiceItemBase):
    """Schema for invoice item response"""
    id: UUID
    invoice_id: UUID
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    created_at: datetime

    class Config:
        from_attributes = True


class InvoiceBase(BaseModel):
    """Base invoice schema"""
    customer_id: UUID
    invoice_date: date
    due_date: Optional[date] = None
    notes: Optional[str] = None


class InvoiceCreate(InvoiceBase):
    """Schema for creating a new invoice"""
    items: List[InvoiceItemCreate]
    status: str = "draft"
    payment_status: str = "pending"


class InvoiceUpdate(BaseModel):
    """Schema for updating an invoice"""
    customer_id: Optional[UUID] = None
    invoice_date: Optional[date] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    payment_status: Optional[str] = None
    notes: Optional[str] = None


class InvoiceResponse(BaseModel):
    """Schema for invoice response"""
    id: UUID
    invoice_number: str
    customer_id: Optional[UUID] = None
    invoice_date: date
    due_date: Optional[date] = None
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    status: str
    payment_status: str
    notes: Optional[str] = None
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class InvoiceWithItems(InvoiceResponse):
    """Invoice with items and customer details"""
    items: List[InvoiceItemResponse] = []
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    customer_address: Optional[str] = None
    customer_gst: Optional[str] = None


class InvoiceSummary(BaseModel):
    """Invoice summary for list view"""
    id: UUID
    invoice_number: str
    customer_name: Optional[str] = None
    invoice_date: date
    total_amount: Decimal
    status: str
    payment_status: str
    created_at: datetime
