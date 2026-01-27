"""
Invoices Router
Handles CRUD operations for invoices and invoice items
Includes PDF generation and WhatsApp sharing
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from supabase import Client
from typing import List, Optional
from uuid import UUID
from decimal import Decimal
from datetime import date
from app.database import get_db
from app.schemas.invoice import (
    InvoiceCreate, 
    InvoiceUpdate, 
    InvoiceResponse,
    InvoiceWithItems,
    InvoiceSummary
)
from app.utils.auth import get_current_active_admin
from app.utils.pdf_generator import generate_invoice_pdf, generate_invoice_number
from app.utils.whatsapp import send_invoice_via_whatsapp

router = APIRouter(prefix="/invoices", tags=["Invoices"])


def calculate_invoice_totals(items: list) -> dict:
    """Calculate invoice totals from items"""
    subtotal = Decimal("0")
    total_tax = Decimal("0")
    total_discount = Decimal("0")
    
    for item in items:
        quantity = Decimal(str(item.get("quantity", 1)))
        unit_price = Decimal(str(item.get("unit_price", 0)))
        tax_rate = Decimal(str(item.get("tax_rate", 0)))
        discount_rate = Decimal(str(item.get("discount_rate", 0)))
        
        item_subtotal = quantity * unit_price
        item_tax = item_subtotal * (tax_rate / 100)
        item_discount = item_subtotal * (discount_rate / 100)
        item_total = item_subtotal + item_tax - item_discount
        
        item["tax_amount"] = float(item_tax)
        item["discount_amount"] = float(item_discount)
        item["total_amount"] = float(item_total)
        
        subtotal += item_subtotal
        total_tax += item_tax
        total_discount += item_discount
    
    total = subtotal + total_tax - total_discount
    
    return {
        "subtotal": float(subtotal),
        "tax_amount": float(total_tax),
        "discount_amount": float(total_discount),
        "total_amount": float(total)
    }


@router.get("/", response_model=List[InvoiceSummary])
async def get_invoices(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    payment_status: Optional[str] = Query(None, description="Filter by payment status"),
    customer_id: Optional[UUID] = Query(None, description="Filter by customer"),
    from_date: Optional[date] = Query(None, description="Filter from date"),
    to_date: Optional[date] = Query(None, description="Filter to date"),
    limit: int = Query(50, ge=1, le=100, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get all invoices (Admin only)
    
    Args:
        status_filter: Filter by invoice status
        payment_status: Filter by payment status
        customer_id: Filter by customer
        from_date: Filter from date
        to_date: Filter to date
        limit: Number of results
        offset: Pagination offset
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        List of invoices
    """
    query = db.table("invoices").select("*, customers(name)").order("created_at", desc=True)
    
    if status_filter:
        query = query.eq("status", status_filter)
    
    if payment_status:
        query = query.eq("payment_status", payment_status)
    
    if customer_id:
        query = query.eq("customer_id", str(customer_id))
    
    if from_date:
        query = query.gte("invoice_date", str(from_date))
    
    if to_date:
        query = query.lte("invoice_date", str(to_date))
    
    query = query.range(offset, offset + limit - 1)
    
    result = query.execute()
    
    # Transform result
    invoices = []
    for inv in result.data:
        customer_data = inv.pop("customers", None)
        inv["customer_name"] = customer_data["name"] if customer_data else None
        invoices.append(inv)
    
    return invoices


@router.get("/{invoice_id}", response_model=InvoiceWithItems)
async def get_invoice(
    invoice_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get a single invoice with items (Admin only)
    
    Args:
        invoice_id: Invoice UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Invoice with items
    """
    # Get invoice
    result = db.table("invoices").select("*, customers(name, phone, address, gst_number)").eq("id", str(invoice_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice = result.data[0]
    customer_data = invoice.pop("customers", None)
    
    if customer_data:
        invoice["customer_name"] = customer_data.get("name")
        invoice["customer_phone"] = customer_data.get("phone")
        invoice["customer_address"] = customer_data.get("address")
        invoice["customer_gst"] = customer_data.get("gst_number")
    
    # Get invoice items
    items_result = db.table("invoice_items").select("*").eq("invoice_id", str(invoice_id)).execute()
    invoice["items"] = items_result.data
    
    return invoice


@router.post("/", response_model=InvoiceWithItems, status_code=status.HTTP_201_CREATED)
async def create_invoice(
    invoice_data: InvoiceCreate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Create a new invoice (Admin only)
    
    Args:
        invoice_data: Invoice data with items
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Created invoice with items
    """
    # Generate invoice number
    last_invoice = db.table("invoices").select("invoice_number").order("created_at", desc=True).limit(1).execute()
    
    if last_invoice.data:
        last_num = int(last_invoice.data[0]["invoice_number"].split("-")[-1])
    else:
        last_num = 0
    
    invoice_number = generate_invoice_number(last_num)
    
    # Calculate totals - convert Decimal to float for JSON serialization
    items_data = []
    for item in invoice_data.items:
        item_dict = item.model_dump()
        # Convert all Decimal fields to float
        for key, value in item_dict.items():
            if isinstance(value, Decimal):
                item_dict[key] = float(value)
        items_data.append(item_dict)
    
    totals = calculate_invoice_totals(items_data)
    
    # Create invoice
    invoice_insert = {
        "invoice_number": invoice_number,
        "customer_id": str(invoice_data.customer_id),
        "invoice_date": str(invoice_data.invoice_date),
        "due_date": str(invoice_data.due_date) if invoice_data.due_date else None,
        "status": invoice_data.status,
        "payment_status": invoice_data.payment_status,
        "notes": invoice_data.notes,
        "created_by": current_admin["id"],
        **totals
    }
    
    invoice_result = db.table("invoices").insert(invoice_insert).execute()
    
    if not invoice_result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create invoice"
        )
    
    invoice = invoice_result.data[0]
    
    # Create invoice items
    for item in items_data:
        item["invoice_id"] = invoice["id"]
        if item.get("product_id"):
            item["product_id"] = str(item["product_id"])
    
    items_result = db.table("invoice_items").insert(items_data).execute()
    
    # Get customer info
    customer_result = db.table("customers").select("name, phone, address, gst_number").eq("id", str(invoice_data.customer_id)).execute()
    
    if customer_result.data:
        customer = customer_result.data[0]
        invoice["customer_name"] = customer.get("name")
        invoice["customer_phone"] = customer.get("phone")
        invoice["customer_address"] = customer.get("address")
        invoice["customer_gst"] = customer.get("gst_number")
    
    invoice["items"] = items_result.data
    
    return invoice


@router.patch("/{invoice_id}/status")
async def update_invoice_status(
    invoice_id: UUID,
    status_data: dict,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Update invoice status (Admin only)
    
    Args:
        invoice_id: Invoice UUID
        status_data: New status {"status": "paid"|"pending"|"cancelled"}
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Updated invoice
    """
    new_status = status_data.get("status")
    if new_status not in ["paid", "pending", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be 'paid', 'pending', or 'cancelled'"
        )
    
    # Update payment_status field
    result = db.table("invoices").update({"payment_status": new_status}).eq("id", str(invoice_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    return {"message": "Status updated successfully", "status": new_status}


@router.get("/{invoice_id}/whatsapp-link")
async def get_invoice_whatsapp_link(
    invoice_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Get WhatsApp link for invoice sharing (Admin only)
    
    Args:
        invoice_id: Invoice UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        WhatsApp URL
    """
    # Get invoice with customer
    result = db.table("invoices").select("invoice_number, total_amount, subtotal, tax_amount, invoice_date, customers(phone, name)").eq("id", str(invoice_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice = result.data[0]
    customer_data = invoice.get("customers", {})
    customer_phone = customer_data.get("phone") if customer_data else None
    customer_name = customer_data.get("name") if customer_data else "Customer"
    
    # Get invoice items
    items_result = db.table("invoice_items").select("product_name, quantity, unit_price, total_amount").eq("invoice_id", str(invoice_id)).execute()
    items = items_result.data or []
    
    # Build items list for message
    items_text = ""
    for i, item in enumerate(items, 1):
        qty = float(item.get('quantity', 1))
        price = float(item.get('unit_price', 0))
        total = float(item.get('total_amount', qty * price))
        items_text += f"\n{i}. {item.get('product_name', 'Item')} - Qty: {qty:.0f} x Rs.{price:.2f} = Rs.{total:.2f}"
    
    # Generate WhatsApp message with items
    import urllib.parse
    subtotal = float(invoice.get('subtotal', 0))
    tax = float(invoice.get('tax_amount', 0))
    total_amount = float(invoice.get('total_amount', 0))
    
    message = f"""Dear {customer_name},

Thank you for your purchase at *Garuda Electricals & Hardwares*!

*Invoice:* #{invoice['invoice_number']}
*Date:* {invoice.get('invoice_date', 'N/A')}

*Items Purchased:*{items_text}

*Subtotal:* Rs.{subtotal:,.2f}
*Tax:* Rs.{tax:,.2f}
*Total Amount:* Rs.{total_amount:,.2f}

Please find the PDF invoice attached.

For any queries, contact us at 917947143780.

Best regards,
*Garuda Electricals & Hardwares*"""
    
    # Clean phone number - remove all non-digit characters
    import re
    if customer_phone:
        phone = re.sub(r'[^\d]', '', customer_phone)  # Keep only digits
        # Ensure it has country code (add 91 for India if not present)
        if len(phone) == 10:
            phone = "91" + phone
    else:
        phone = ""
    
    whatsapp_url = f"https://wa.me/{phone}?text={urllib.parse.quote(message)}"
    
    return {"whatsapp_url": whatsapp_url}


@router.put("/{invoice_id}", response_model=InvoiceResponse)
async def update_invoice(
    invoice_id: UUID,
    invoice_data: InvoiceUpdate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Update an invoice (Admin only)
    
    Args:
        invoice_id: Invoice UUID
        invoice_data: Updated invoice data
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Updated invoice
    """
    # Check if invoice exists
    existing = db.table("invoices").select("id").eq("id", str(invoice_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Update invoice
    update_data = {k: v for k, v in invoice_data.model_dump().items() if v is not None}
    
    if update_data.get("customer_id"):
        update_data["customer_id"] = str(update_data["customer_id"])
    if update_data.get("invoice_date"):
        update_data["invoice_date"] = str(update_data["invoice_date"])
    if update_data.get("due_date"):
        update_data["due_date"] = str(update_data["due_date"])
    
    result = db.table("invoices").update(update_data).eq("id", str(invoice_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update invoice"
        )
    
    return result.data[0]


@router.delete("/{invoice_id}")
async def delete_invoice(
    invoice_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Delete an invoice (Admin only)
    
    Args:
        invoice_id: Invoice UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Success message
    """
    # Check if invoice exists
    existing = db.table("invoices").select("id").eq("id", str(invoice_id)).execute()
    
    if not existing.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    # Delete invoice items first (cascade should handle this, but being explicit)
    db.table("invoice_items").delete().eq("invoice_id", str(invoice_id)).execute()
    
    # Delete invoice
    db.table("invoices").delete().eq("id", str(invoice_id)).execute()
    
    return {"message": "Invoice deleted successfully"}


@router.get("/{invoice_id}/pdf")
async def get_invoice_pdf(
    invoice_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Generate and download invoice PDF (Admin only)
    
    Args:
        invoice_id: Invoice UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        PDF file stream
    """
    # Get invoice with items
    result = db.table("invoices").select("*, customers(name, phone, address, gst_number)").eq("id", str(invoice_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice = result.data[0]
    customer_data = invoice.pop("customers", None)
    
    if customer_data:
        invoice["customer_name"] = customer_data.get("name")
        invoice["customer_phone"] = customer_data.get("phone")
        invoice["customer_address"] = customer_data.get("address")
        invoice["customer_gst"] = customer_data.get("gst_number")
    
    # Get invoice items
    items_result = db.table("invoice_items").select("*").eq("invoice_id", str(invoice_id)).execute()
    invoice["items"] = items_result.data
    
    # Generate PDF
    pdf_buffer = generate_invoice_pdf(invoice)
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=Invoice-{invoice['invoice_number']}.pdf"
        }
    )


@router.post("/{invoice_id}/send-whatsapp")
async def send_invoice_whatsapp(
    invoice_id: UUID,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Send invoice via WhatsApp (Mock implementation) (Admin only)
    
    Args:
        invoice_id: Invoice UUID
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        WhatsApp link and status
    """
    # Get invoice
    result = db.table("invoices").select("invoice_number, total_amount, customers(phone)").eq("id", str(invoice_id)).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invoice not found"
        )
    
    invoice = result.data[0]
    customer_data = invoice.get("customers", {})
    customer_phone = customer_data.get("phone") if customer_data else None
    
    if not customer_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Customer phone number not found"
        )
    
    # Send via WhatsApp (mock)
    response = await send_invoice_via_whatsapp(
        customer_phone=customer_phone,
        invoice_number=invoice["invoice_number"],
        total_amount=float(invoice["total_amount"])
    )
    
    return response
