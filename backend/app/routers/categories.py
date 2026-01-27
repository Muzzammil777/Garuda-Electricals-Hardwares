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


@router.post("/seed/initialize", response_model=dict)
async def seed_default_categories(
    db: Client = Depends(get_db)
):
    """
    Initialize default electrical product categories
    This is a public endpoint for initial setup
    
    Args:
        db: Database client
        
    Returns:
        Success message with number of categories created
    """
    default_categories = [
        {
            "name": "Wires & Cables",
            "slug": "wires-cables",
            "description": "Electrical wires, cables, and conductors",
            "display_order": 1,
            "is_active": True
        },
        {
            "name": "Switches & Switchgear",
            "slug": "switches-switchgear",
            "description": "Electrical switches, MCBs, and switchgear",
            "display_order": 2,
            "is_active": True
        },
        {
            "name": "Lighting",
            "slug": "lighting",
            "description": "LED lights, bulbs, tubes, and fixtures",
            "display_order": 3,
            "is_active": True
        },
        {
            "name": "Fans",
            "slug": "fans",
            "description": "Electric fans and cooling equipment",
            "display_order": 4,
            "is_active": True
        },
        {
            "name": "Panels & Boards",
            "slug": "panels-boards",
            "description": "Distribution panels and electrical boards",
            "display_order": 5,
            "is_active": True
        },
        {
            "name": "Conduits & Fittings",
            "slug": "conduits-fittings",
            "description": "Electrical conduits and PVC fittings",
            "display_order": 6,
            "is_active": True
        },
        {
            "name": "Plugs & Sockets",
            "slug": "plugs-sockets",
            "description": "Electrical plugs, sockets, and outlets",
            "display_order": 7,
            "is_active": True
        },
        {
            "name": "Transformers & Stabilizers",
            "slug": "transformers-stabilizers",
            "description": "Transformers, voltage stabilizers, and converters",
            "display_order": 8,
            "is_active": True
        },
        {
            "name": "Circuit Protection",
            "slug": "circuit-protection",
            "description": "MCBs, RCCBs, and circuit breakers",
            "display_order": 9,
            "is_active": True
        },
        {
            "name": "Hardware & Accessories",
            "slug": "hardware-accessories",
            "description": "Electrical hardware, fasteners, and accessories",
            "display_order": 10,
            "is_active": True
        }
    ]
    
    created_count = 0
    
    for category_data in default_categories:
        # Check if category already exists
        existing = db.table("categories").select("id").eq("slug", category_data["slug"]).execute()
        
        if not existing.data:
            try:
                db.table("categories").insert(category_data).execute()
                created_count += 1
            except Exception as e:
                print(f"Error creating category {category_data['name']}: {e}")
    
    return {
        "message": f"Initialized {created_count} default categories",
        "categories_created": created_count
    }

