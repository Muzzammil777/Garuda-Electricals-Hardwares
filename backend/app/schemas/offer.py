"""
Pydantic schemas for Offers
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from uuid import UUID
from decimal import Decimal


class OfferBase(BaseModel):
    """Base offer schema"""
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    discount_percentage: Optional[Decimal] = None
    offer_code: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    display_order: int = 0


class OfferCreate(OfferBase):
    """Schema for creating a new offer"""
    is_active: bool = True


class OfferUpdate(BaseModel):
    """Schema for updating an offer"""
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    discount_percentage: Optional[Decimal] = None
    offer_code: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    display_order: Optional[int] = None


class OfferResponse(OfferBase):
    """Schema for offer response"""
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
