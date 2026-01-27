"""
Customers Router
Handles CRUD operations for customers
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from supabase import Client
from typing import List, Optional
from uuid import UUID
from app.database import get_db
from app.schemas.customer import (
    CustomerCreate, 
    CustomerUpdate, 
    CustomerResponse,
    CustomerWithInvoiceCount
)
from app.utils.auth import get_current_active_admin

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("/", response_model=List[CustomerResponse])
async def get_customers(
    active_only: bool = Query(True, description="Filter by active status"),
    search: Optional[str] = Query(None, description="Search in name and phone"),
    limit: int = Query(50, ge=1, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get all customers (Admin only)
    
    Args:
        active_only: If True, only return active customers
        search: Search query
        limit: Number of results
        offset: Pagination offset
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        List of customers
    """
    query = db.table("customers").select("*").order("created_at", desc=True)
    
    if active_only:
        query = query.eq("is_active", True)
    
    if search:
        query = query.or_(f"name.ilike.%{search}%,phone.ilike.%{search}%")
    
    query = query.range(offset, offset + limit - 1)
    
    result = query.execute()
    
    return result.data


@router.get("/with-stats", response_model=List[CustomerWithInvoiceCount])
async def get_customers_with_stats(
    active_only: bool = Query(True, description="Filter by active status"),
    limit: int = Query(50, ge=1, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get all customers with invoice statistics (Admin only)
    
    Args:
        active_only: If True, only return active customers
        limit: Number of results
        offset: Pagination offset
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        List of customers with stats
    """
    query = db.table("customers").select("*").order("created_at", desc=True)
    
    if active_only:
        query = query.eq("is_active", True)
    
    query = query.range(offset, offset + limit - 1)
    
    result = query.execute()
    customers = result.data
    
    # Get invoice counts and totals for each customer
    for customer in customers:
        invoice_result = db.table("invoices").select("id, total_amount").eq("customer_id", customer["id"]).execute()
        customer["invoice_count"] = len(invoice_result.data)
        customer["total_amount"] = sum(inv["total_amount"] for inv in invoice_result.data) if invoice_result.data else 0
    
    return customers


@router.get("/{customer_id}", response_model=CustomerResponse)
async def get_customer(
    customer_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get a single customer by ID (Admin only)
    
    Args:
        customer_id: Customer UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Customer details
    """
    result = db.table("customers").select("*").eq("id", str(customer_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    return result.data[0]


@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    customer_data: CustomerCreate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Create a new customer (Admin only)
    
    Args:
        customer_data: Customer data
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Created customer
    """
    # Create customer
    result = db.table("customers").insert(customer_data.model_dump()).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create customer"
        )
    
    return result.data[0]


@router.put("/{customer_id}", response_model=CustomerResponse)
async def update_customer(
    customer_id: UUID,
    customer_data: CustomerUpdate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Update a customer (Admin only)
    
    Args:
        customer_id: Customer UUID
        customer_data: Updated customer data
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Updated customer
    """
    # Check if customer exists
    existing = db.table("customers").select("id").eq("id", str(customer_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Update customer
    update_data = {k: v for k, v in customer_data.model_dump().items() if v is not None}
    
    result = db.table("customers").update(update_data).eq("id", str(customer_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update customer"
        )
    
    return result.data[0]


@router.delete("/{customer_id}")
async def delete_customer(
    customer_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Delete a customer (Admin only)
    
    Args:
        customer_id: Customer UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Success message
    """
    # Check if customer exists
    existing = db.table("customers").select("id").eq("id", str(customer_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )
    
    # Delete customer
    db.table("customers").delete().eq("id", str(customer_id)).execute()
    
    return {"message": "Customer deleted successfully"}
