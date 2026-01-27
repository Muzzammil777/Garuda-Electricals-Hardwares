"""
Contact Router
Handles contact form submissions
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import List
from uuid import UUID
from app.database import get_db
from app.schemas.contact import (
    ContactMessageCreate, 
    ContactMessageResponse, 
    ContactMessageUpdate
)
from app.utils.auth import get_current_active_admin

router = APIRouter(prefix="/contact", tags=["Contact"])


@router.post("/", response_model=ContactMessageResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    message_data: ContactMessageCreate,
    db: Client = Depends(get_db)
):
    """
    Submit a contact form message (Public)
    
    Args:
        message_data: Contact message data
        db: Database client
        
    Returns:
        Created message
    """
    # Create message
    result = db.table("contact_messages").insert(message_data.model_dump()).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit message"
        )
    
    return result.data[0]


@router.get("/", response_model=List[ContactMessageResponse])
async def get_contact_messages(
    unread_only: bool = Query(False, description="Filter by unread status"),
    limit: int = Query(50, ge=1, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get all contact messages (Admin only)
    
    Args:
        unread_only: If True, only return unread messages
        limit: Number of results
        offset: Pagination offset
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        List of messages
    """
    query = db.table("contact_messages").select("*").order("created_at", desc=True)
    
    if unread_only:
        query = query.eq("is_read", False)
    
    query = query.range(offset, offset + limit - 1)
    
    result = query.execute()
    
    return result.data


@router.get("/{message_id}", response_model=ContactMessageResponse)
async def get_contact_message(
    message_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get a single contact message (Admin only)
    
    Args:
        message_id: Message UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Message details
    """
    result = db.table("contact_messages").select("*").eq("id", str(message_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    return result.data[0]


@router.put("/{message_id}/read")
async def mark_message_read(
    message_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Mark a message as read (Admin only)
    
    Args:
        message_id: Message UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Success message
    """
    # Check if message exists
    existing = db.table("contact_messages").select("id").eq("id", str(message_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Mark as read
    db.table("contact_messages").update({"is_read": True}).eq("id", str(message_id)).execute()
    
    return {"message": "Message marked as read"}


@router.delete("/{message_id}")
async def delete_contact_message(
    message_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Delete a contact message (Admin only)
    
    Args:
        message_id: Message UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Success message
    """
    # Check if message exists
    existing = db.table("contact_messages").select("id").eq("id", str(message_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    # Delete message
    db.table("contact_messages").delete().eq("id", str(message_id)).execute()
    
    return {"message": "Message deleted successfully"}
