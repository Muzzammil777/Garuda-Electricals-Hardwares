"""
Settings Router
Handles site-wide settings like contact details
"""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from typing import Dict, Any
from app.database import get_db
from app.utils.auth import get_current_active_admin

router = APIRouter(prefix="/settings", tags=["Settings"])

# Default settings
DEFAULT_SETTINGS = {
    "business_name": "Garuda Electricals & Hardwares",
    "business_email": "Garudaelectrical@gmail.com",
    "business_phone": "919489114403",
    "business_whatsapp": "919489114403",
    "business_gst": "33BLPPS4603G1Z0",
    "business_address": "No 51/1, Near Trichy Main Road, Gandhigramam",
    "business_city": "Karur",
    "business_pincode": "639004",
    "google_maps_url": "https://www.google.com/maps/place/GARUDA+ELECTRICALS/@10.9473066,78.1016167,17z",
    "google_maps_embed": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.8596112528863!2d78.10419157480366!3d10.947301389221685!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3baa2fe6bfffffe9%3A0x758cc7763a40c83c!2sGARUDA%20ELECTRICALS!5e0!3m2!1sen!2sin!4v1706359200000!5m2!1sen!2sin",
    "working_hours": "9:00 AM - 8:00 PM",
    "working_days": "Monday - Saturday",
    "facebook_url": "",
    "instagram_url": "",
    "twitter_url": "",
    "youtube_url": ""
}


@router.get("/")
async def get_settings(
    db: Client = Depends(get_db)
):
    """
    Get all site settings (Public)
    
    Returns:
        Dictionary of all settings
    """
    try:
        result = db.table("settings").select("key, value").execute()
        
        if not result.data:
            # Return default settings if none exist
            return DEFAULT_SETTINGS
        
        # Convert to dictionary
        settings = DEFAULT_SETTINGS.copy()
        for item in result.data:
            settings[item["key"]] = item["value"]
        
        return settings
    except Exception as e:
        # Return defaults if table doesn't exist
        return DEFAULT_SETTINGS


@router.put("/")
async def update_settings(
    settings_data: Dict[str, Any],
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Update site settings (Admin only)
    
    Args:
        settings_data: Dictionary of settings to update
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Updated settings
    """
    try:
        # Upsert each setting
        for key, value in settings_data.items():
            # Try to update first
            existing = db.table("settings").select("id").eq("key", key).execute()
            
            if existing.data:
                db.table("settings").update({"value": str(value)}).eq("key", key).execute()
            else:
                db.table("settings").insert({"key": key, "value": str(value)}).execute()
        
        # Return updated settings
        result = db.table("settings").select("key, value").execute()
        settings = DEFAULT_SETTINGS.copy()
        if result.data:
            for item in result.data:
                settings[item["key"]] = item["value"]
        return settings
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update settings: {str(e)}"
        )


@router.post("/initialize")
async def initialize_settings(
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Initialize settings with defaults (Admin only)
    
    Args:
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Initialized settings
    """
    try:
        for key, value in DEFAULT_SETTINGS.items():
            existing = db.table("settings").select("id").eq("key", key).execute()
            
            if not existing.data:
                db.table("settings").insert({"key": key, "value": str(value)}).execute()
        
        return {"message": "Settings initialized successfully", "settings": DEFAULT_SETTINGS}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initialize settings: {str(e)}"
        )
