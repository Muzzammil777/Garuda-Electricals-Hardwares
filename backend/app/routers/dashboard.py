"""
Dashboard Router
Provides statistics and overview data for admin dashboard
"""

from fastapi import APIRouter, Depends
from supabase import Client
from app.database import get_db
from app.utils.auth import get_current_active_admin
from datetime import date, timedelta

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get dashboard statistics (Admin only)
    
    Args:
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Dashboard statistics
    """
    # Get total products
    products_result = db.table("products").select("id", count="exact").eq("is_active", True).execute()
    total_products = products_result.count or 0
    
    # Get total customers
    customers_result = db.table("customers").select("id", count="exact").eq("is_active", True).execute()
    total_customers = customers_result.count or 0
    
    # Get total invoices
    invoices_result = db.table("invoices").select("id", count="exact").execute()
    total_invoices = invoices_result.count or 0
    
    # Get total categories
    categories_result = db.table("categories").select("id", count="exact").eq("is_active", True).execute()
    total_categories = categories_result.count or 0
    
    # Get pending invoices
    pending_result = db.table("invoices").select("id", count="exact").eq("payment_status", "pending").execute()
    pending_invoices = pending_result.count or 0
    
    # Get unread messages
    messages_result = db.table("contact_messages").select("id", count="exact").eq("is_read", False).execute()
    unread_messages = messages_result.count or 0
    
    # Get total revenue
    revenue_result = db.table("invoices").select("total_amount").eq("payment_status", "paid").execute()
    total_revenue = sum(float(inv["total_amount"] or 0) for inv in revenue_result.data) if revenue_result.data else 0
    
    # Get revenue this month
    from datetime import datetime
    first_of_month = date.today().replace(day=1)
    revenue_month_result = db.table("invoices").select("total_amount").eq("payment_status", "paid").gte("invoice_date", str(first_of_month)).execute()
    revenue_this_month = sum(float(inv["total_amount"] or 0) for inv in revenue_month_result.data) if revenue_month_result.data else 0
    
    # Get active offers
    today = str(date.today())
    offers_result = db.table("offers").select("id", count="exact").eq("is_active", True).execute()
    active_offers = offers_result.count or 0
    
    return {
        "total_products": total_products,
        "total_customers": total_customers,
        "total_invoices": total_invoices,
        "total_categories": total_categories,
        "pending_invoices": pending_invoices,
        "unread_messages": unread_messages,
        "total_revenue": total_revenue,
        "revenue_this_month": revenue_this_month,
        "active_offers": active_offers
    }


@router.get("/recent-invoices")
async def get_recent_invoices(
    limit: int = 5,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get recent invoices (Admin only)
    
    Args:
        limit: Number of invoices to return
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        List of recent invoices
    """
    result = db.table("invoices").select("*, customers(name)").order("created_at", desc=True).limit(limit).execute()
    
    invoices = []
    for inv in result.data:
        customer_data = inv.pop("customers", None)
        inv["customer_name"] = customer_data["name"] if customer_data else None
        invoices.append(inv)
    
    return invoices


@router.get("/recent-customers")
async def get_recent_customers(
    limit: int = 5,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get recently added customers (Admin only)
    
    Args:
        limit: Number of customers to return
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        List of recent customers
    """
    result = db.table("customers").select("*").order("created_at", desc=True).limit(limit).execute()
    
    return result.data


@router.get("/top-products")
async def get_top_products(
    limit: int = 5,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get top products by invoice frequency (Admin only)
    
    Args:
        limit: Number of products to return
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        List of top products
    """
    # Get invoice items grouped by product
    result = db.table("invoice_items").select("product_name, product_id").execute()
    
    # Count occurrences
    product_counts = {}
    for item in result.data:
        name = item["product_name"]
        if name in product_counts:
            product_counts[name] += 1
        else:
            product_counts[name] = 1
    
    # Sort and get top products
    sorted_products = sorted(product_counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    return [{"product_name": name, "count": count} for name, count in sorted_products]


@router.get("/monthly-revenue")
async def get_monthly_revenue(
    months: int = 6,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get monthly revenue for the past N months (Admin only)
    
    Args:
        months: Number of months
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Monthly revenue data
    """
    result = db.table("invoices").select("invoice_date, total_amount").eq("payment_status", "paid").execute()
    
    # Group by month
    monthly_data = {}
    for inv in result.data:
        inv_date = inv["invoice_date"]
        month_key = inv_date[:7]  # YYYY-MM
        if month_key in monthly_data:
            monthly_data[month_key] += inv["total_amount"]
        else:
            monthly_data[month_key] = inv["total_amount"]
    
    # Sort and return
    sorted_months = sorted(monthly_data.items(), reverse=True)[:months]
    
    return [{"month": month, "revenue": revenue} for month, revenue in reversed(sorted_months)]
