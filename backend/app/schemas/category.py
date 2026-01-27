"""
Pydantic schemas for Category
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class CategoryBase(BaseModel):
    """Base category schema"""
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    display_order: int = 0


class CategoryCreate(CategoryBase):
    """Schema for creating a new category"""
    is_active: bool = True


class CategoryUpdate(BaseModel):
    """Schema for updating a category"""
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    icon: Optional[str] = None
    display_order: Optional[int] = None
    is_active: Optional[bool] = None


class CategoryResponse(CategoryBase):
    """Schema for category response"""
    id: UUID
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CategoryWithProductCount(CategoryResponse):
    """Category with product count"""
    product_count: int = 0
