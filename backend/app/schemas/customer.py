"""
Pydantic schemas for Customer
"""

from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime
from uuid import UUID


class CustomerBase(BaseModel):
    """Base customer schema"""
    name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gst_number: Optional[str] = None
    notes: Optional[str] = None
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        """Validate email format if provided"""
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v


class CustomerCreate(CustomerBase):
    """Schema for creating a new customer"""
    is_active: bool = True


class CustomerUpdate(BaseModel):
    """Schema for updating a customer"""
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    gst_number: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None
    
    @field_validator('email')
    @classmethod
    def validate_email(cls, v):
        """Validate email format if provided"""
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v


class CustomerResponse(CustomerBase):
    """Schema for customer response"""
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CustomerWithInvoiceCount(CustomerResponse):
    """Customer with invoice count"""
    invoice_count: int = 0
    total_amount: float = 0.0
