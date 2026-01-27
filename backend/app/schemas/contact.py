"""
Pydantic schemas for Contact Messages
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID


class ContactMessageBase(BaseModel):
    """Base contact message schema"""
    name: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    subject: Optional[str] = None
    message: str


class ContactMessageCreate(ContactMessageBase):
    """Schema for creating a new contact message"""
    pass


class ContactMessageResponse(ContactMessageBase):
    """Schema for contact message response"""
    id: UUID
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ContactMessageUpdate(BaseModel):
    """Schema for updating a contact message"""
    is_read: Optional[bool] = None
