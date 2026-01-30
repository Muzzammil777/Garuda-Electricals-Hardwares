"""
Products Router
Handles CRUD operations for products
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel
from app.database import get_db
from app.schemas.product import (
    ProductCreate, 
    ProductUpdate, 
    ProductResponse,
    ProductWithCategory
)
from app.utils.auth import get_current_active_admin
from app.utils.whatsapp import generate_product_enquiry_link

router = APIRouter(prefix="/products", tags=["Products"])


class PaginatedResponse(BaseModel):
    """Pagination response wrapper"""
    products: List[ProductWithCategory]
    total: int
    limit: int
    offset: int
    has_more: bool


@router.get("/", response_model=List[ProductWithCategory])
async def get_products(
    category_id: Optional[UUID] = Query(None, description="Filter by category"),
    category_slug: Optional[str] = Query(None, description="Filter by category slug"),
    featured: Optional[bool] = Query(None, description="Filter by featured status"),
    active_only: bool = Query(True, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    limit: int = Query(20, ge=1, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Client = Depends(get_db)
):
    """
    Get all products with optional filters and pagination
    
    Args:
        category_id: Filter by category ID
        category_slug: Filter by category slug
        featured: Filter by featured status
        active_only: If True, only return active products
        search: Search query
        limit: Number of results (default: 20, max: 100)
        offset: Pagination offset
        db: Database client
        
    Returns:
        List of products
    """
    # Select only necessary fields for better performance
    product_fields = "id,name,slug,brand,price,unit,image_url,short_description,is_featured,is_active,category_id,created_at,updated_at"
    
    # Base query with select
    query = db.table("products").select(f"{product_fields}, categories(name, slug)")
    
    # Apply filters
    if active_only:
        query = query.eq("is_active", True)
    
    if category_id:
        query = query.eq("category_id", str(category_id))
    
    if featured is not None:
        query = query.eq("is_featured", featured)
    
    if search:
        query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%,brand.ilike.%{search}%")
    
    # Get category by slug if provided
    if category_slug and not category_id:
        cat_result = db.table("categories").select("id").eq("slug", category_slug).execute()
        if cat_result.data:
            query = query.eq("category_id", cat_result.data[0]["id"])
    
    # Order and apply pagination
    query = query.order("created_at", desc=True)
    query = query.range(offset, offset + limit - 1)
    
    result = query.execute()
    
    # Transform result to include category info
    products = []
    for product in result.data:
        category_data = product.pop("categories", None)
        product["category_name"] = category_data["name"] if category_data else None
        product["category_slug"] = category_data["slug"] if category_data else None
        products.append(product)
    
    return products


@router.get("/featured", response_model=List[ProductWithCategory])
async def get_featured_products(
    limit: int = Query(8, ge=1, le=20, description="Number of results"),
    db: Client = Depends(get_db)
):
    """
    Get featured products
    
    Args:
        limit: Number of results
        db: Database client
        
    Returns:
        List of featured products
    """
    # Select only necessary fields for better performance
    product_fields = "id,name,slug,brand,price,unit,image_url,short_description,is_featured,category_id,created_at,updated_at"
    
    result = db.table("products").select(f"{product_fields}, categories(name, slug)").eq("is_active", True).eq("is_featured", True).order("created_at", desc=True).limit(limit).execute()
    
    products = []
    for product in result.data:
        category_data = product.pop("categories", None)
        product["category_name"] = category_data["name"] if category_data else None
        product["category_slug"] = category_data["slug"] if category_data else None
        products.append(product)
    
    return products


@router.get("/{product_id}", response_model=ProductWithCategory)
async def get_product(product_id: UUID, db: Client = Depends(get_db)):
    """
    Get a single product by ID
    
    Args:
        product_id: Product UUID
        db: Database client
        
    Returns:
        Product details
    """
    result = db.table("products").select("*, categories(name, slug)").eq("id", str(product_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product = result.data[0]
    category_data = product.pop("categories", None)
    product["category_name"] = category_data["name"] if category_data else None
    product["category_slug"] = category_data["slug"] if category_data else None
    
    return product


@router.get("/slug/{slug}", response_model=ProductWithCategory)
async def get_product_by_slug(slug: str, db: Client = Depends(get_db)):
    """
    Get a single product by slug
    
    Args:
        slug: Product slug
        db: Database client
        
    Returns:
        Product details
    """
    result = db.table("products").select("*, categories(name, slug)").eq("slug", slug).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product = result.data[0]
    category_data = product.pop("categories", None)
    product["category_name"] = category_data["name"] if category_data else None
    product["category_slug"] = category_data["slug"] if category_data else None
    
    return product


@router.get("/{product_id}/whatsapp-link")
async def get_product_whatsapp_link(product_id: UUID, db: Client = Depends(get_db)):
    """
    Get WhatsApp enquiry link for a product
    
    Args:
        product_id: Product UUID
        db: Database client
        
    Returns:
        WhatsApp link
    """
    result = db.table("products").select("name, brand").eq("id", str(product_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product = result.data[0]
    whatsapp_link = generate_product_enquiry_link(product["name"], product.get("brand"))
    
    return {"whatsapp_link": whatsapp_link}


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Create a new product (Admin only)
    
    Args:
        product_data: Product data
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Created product
    """
    # Check if slug already exists
    existing = db.table("products").select("id").eq("slug", product_data.slug).execute()
    
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product with this slug already exists"
        )
    
    # Prepare data
    data = product_data.model_dump()
    if data.get("category_id"):
        data["category_id"] = str(data["category_id"])
    if data.get("price"):
        data["price"] = float(data["price"])
    
    # Create product
    result = db.table("products").insert(data).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create product"
        )
    
    return result.data[0]


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product_data: ProductUpdate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Update a product (Admin only)
    
    Args:
        product_id: Product UUID
        product_data: Updated product data
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Updated product
    """
    # Check if product exists
    existing = db.table("products").select("id").eq("id", str(product_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check slug uniqueness if updating slug
    if product_data.slug:
        slug_check = db.table("products").select("id").eq("slug", product_data.slug).neq("id", str(product_id)).execute()
        if slug_check.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product with this slug already exists"
            )
    
    # Update product
    update_data = {k: v for k, v in product_data.model_dump().items() if v is not None}
    if update_data.get("category_id"):
        update_data["category_id"] = str(update_data["category_id"])
    if update_data.get("price"):
        update_data["price"] = float(update_data["price"])
    
    result = db.table("products").update(update_data).eq("id", str(product_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update product"
        )
    
    return result.data[0]


@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Delete a product (Admin only)
    
    Args:
        product_id: Product UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Success message
    """
    # Check if product exists
    existing = db.table("products").select("id").eq("id", str(product_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Delete product
    db.table("products").delete().eq("id", str(product_id)).execute()
    
    return {"message": "Product deleted successfully"}
