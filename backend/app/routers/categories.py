"""
Categories Router
Handles CRUD operations for product categories
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.schemas.category import (
    CategoryCreate, 
    CategoryUpdate, 
    CategoryResponse,
    CategoryWithProductCount
)
from app.utils.auth import get_current_active_admin

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("/", response_model=List[CategoryResponse])
async def get_categories(
    active_only: bool = Query(True, description="Filter by active status"),
    db: Client = Depends(get_db)
):
    """
    Get all categories
    
    Args:
        active_only: If True, only return active categories
        db: Database client
        
    Returns:
        List of categories
    """
    query = db.table("categories").select("*").order("display_order")
    
    if active_only:
        query = query.eq("is_active", True)
    
    result = query.execute()
    
    return result.data


@router.get("/with-counts", response_model=List[CategoryWithProductCount])
async def get_categories_with_product_counts(
    active_only: bool = Query(True, description="Filter by active status"),
    db: Client = Depends(get_db)
):
    """
    Get all categories with product counts
    
    Args:
        active_only: If True, only return active categories
        db: Database client
        
    Returns:
        List of categories with product counts
    """
    query = db.table("categories").select("*").order("display_order")
    
    if active_only:
        query = query.eq("is_active", True)
    
    result = query.execute()
    categories = result.data
    
    # Get product counts for each category
    for category in categories:
        count_result = db.table("products").select("id", count="exact").eq("category_id", category["id"]).eq("is_active", True).execute()
        category["product_count"] = count_result.count or 0
    
    return categories


@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(category_id: UUID, db: Client = Depends(get_db)):
    """
    Get a single category by ID
    
    Args:
        category_id: Category UUID
        db: Database client
        
    Returns:
        Category details
    """
    result = db.table("categories").select("*").eq("id", str(category_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return result.data[0]


@router.get("/slug/{slug}", response_model=CategoryResponse)
async def get_category_by_slug(slug: str, db: Client = Depends(get_db)):
    """
    Get a single category by slug
    
    Args:
        slug: Category slug
        db: Database client
        
    Returns:
        Category details
    """
    result = db.table("categories").select("*").eq("slug", slug).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    return result.data[0]


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Create a new category (Admin only)
    
    Args:
        category_data: Category data
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Created category
    """
    # Check if slug already exists
    existing = db.table("categories").select("id").eq("slug", category_data.slug).execute()
    
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this slug already exists"
        )
    
    # Create category
    result = db.table("categories").insert(category_data.model_dump()).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create category"
        )
    
    return result.data[0]


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: UUID,
    category_data: CategoryUpdate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Update a category (Admin only)
    
    Args:
        category_id: Category UUID
        category_data: Updated category data
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Updated category
    """
    # Check if category exists
    existing = db.table("categories").select("id").eq("id", str(category_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check slug uniqueness if updating slug
    if category_data.slug:
        slug_check = db.table("categories").select("id").eq("slug", category_data.slug).neq("id", str(category_id)).execute()
        if slug_check.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this slug already exists"
            )
    
    # Update category
    update_data = {k: v for k, v in category_data.model_dump().items() if v is not None}
    
    result = db.table("categories").update(update_data).eq("id", str(category_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update category"
        )
    
    return result.data[0]


@router.delete("/{category_id}")
async def delete_category(
    category_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Delete a category (Admin only)
    
    Args:
        category_id: Category UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Success message
    """
    # Check if category exists
    existing = db.table("categories").select("id").eq("id", str(category_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Delete category
    db.table("categories").delete().eq("id", str(category_id)).execute()
    
    return {"message": "Category deleted successfully"}
