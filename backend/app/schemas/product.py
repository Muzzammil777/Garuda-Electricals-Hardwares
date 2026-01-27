"""
Pydantic schemas for Product
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal


class ProductBase(BaseModel):
    """Base product schema"""
    name: str
    slug: str
    brand: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[Decimal] = None
    unit: str = "piece"
    stock_quantity: int = 0
    is_featured: bool = False


class ProductCreate(ProductBase):
    """Schema for creating a new product"""
    category_id: Optional[UUID] = None
    is_active: bool = True


class ProductUpdate(BaseModel):
    """Schema for updating a product"""
    category_id: Optional[UUID] = None
    name: Optional[str] = None
    slug: Optional[str] = None
    brand: Optional[str] = None
    description: Optional[str] = None
    short_description: Optional[str] = None
    image_url: Optional[str] = None
    price: Optional[Decimal] = None
    unit: Optional[str] = None
    stock_quantity: Optional[int] = None
    is_featured: Optional[bool] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    """Schema for product response"""
    id: UUID
    category_id: Optional[UUID] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductWithCategory(ProductResponse):
    """Product with category information"""
    category_name: Optional[str] = None
    category_slug: Optional[str] = None
