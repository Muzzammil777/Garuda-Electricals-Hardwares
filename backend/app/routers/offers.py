"""
Offers Router
Handles CRUD operations for offers/promotions
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import List, Optional
from uuid import UUID
from datetime import date
from app.database import get_db
from app.schemas.offer import OfferCreate, OfferUpdate, OfferResponse
from app.utils.auth import get_current_active_admin

router = APIRouter(prefix="/offers", tags=["Offers"])


@router.get("/", response_model=List[OfferResponse])
async def get_offers(
    active_only: bool = Query(True, description="Filter by active status"),
    current_only: bool = Query(True, description="Filter by current date range"),
    db: Client = Depends(get_db)
):
    """
    Get all offers
    
    Args:
        active_only: If True, only return active offers
        current_only: If True, only return offers valid today
        db: Database client
        
    Returns:
        List of offers
    """
    query = db.table("offers").select("*").order("display_order")
    
    if active_only:
        query = query.eq("is_active", True)
    
    if current_only:
        today = str(date.today())
        query = query.or_(f"start_date.is.null,start_date.lte.{today}")
        query = query.or_(f"end_date.is.null,end_date.gte.{today}")
    
    result = query.execute()
    
    return result.data


@router.get("/all", response_model=List[OfferResponse])
async def get_all_offers(
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get all offers including inactive (Admin only)
    
    Args:
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        List of all offers
    """
    result = db.table("offers").select("*").order("display_order").execute()
    
    return result.data


@router.get("/{offer_id}", response_model=OfferResponse)
async def get_offer(offer_id: UUID, db: Client = Depends(get_db)):
    """
    Get a single offer by ID
    
    Args:
        offer_id: Offer UUID
        db: Database client
        
    Returns:
        Offer details
    """
    result = db.table("offers").select("*").eq("id", str(offer_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    return result.data[0]


@router.post("/", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    offer_data: OfferCreate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Create a new offer (Admin only)
    
    Args:
        offer_data: Offer data
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Created offer
    """
    # Prepare data
    data = offer_data.model_dump()
    if data.get("discount_percentage"):
        data["discount_percentage"] = float(data["discount_percentage"])
    if data.get("start_date"):
        data["start_date"] = str(data["start_date"])
    if data.get("end_date"):
        data["end_date"] = str(data["end_date"])
    
    # Create offer
    result = db.table("offers").insert(data).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create offer"
        )
    
    return result.data[0]


@router.put("/{offer_id}", response_model=OfferResponse)
async def update_offer(
    offer_id: UUID,
    offer_data: OfferUpdate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Update an offer (Admin only)
    
    Args:
        offer_id: Offer UUID
        offer_data: Updated offer data
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Updated offer
    """
    # Check if offer exists
    existing = db.table("offers").select("id").eq("id", str(offer_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    # Update offer
    update_data = {k: v for k, v in offer_data.model_dump().items() if v is not None}
    
    if update_data.get("discount_percentage"):
        update_data["discount_percentage"] = float(update_data["discount_percentage"])
    if update_data.get("start_date"):
        update_data["start_date"] = str(update_data["start_date"])
    if update_data.get("end_date"):
        update_data["end_date"] = str(update_data["end_date"])
    
    result = db.table("offers").update(update_data).eq("id", str(offer_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update offer"
        )
    
    return result.data[0]


@router.delete("/{offer_id}")
async def delete_offer(
    offer_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Delete an offer (Admin only)
    
    Args:
        offer_id: Offer UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Success message
    """
    # Check if offer exists
    existing = db.table("offers").select("id").eq("id", str(offer_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Offer not found"
        )
    
    # Delete offer
    db.table("offers").delete().eq("id", str(offer_id)).execute()
    
    return {"message": "Offer deleted successfully"}
