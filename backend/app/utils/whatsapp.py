"""
WhatsApp Integration Utilities
Mock implementation for sending WhatsApp messages
"""

from typing import Optional
from urllib.parse import quote
from app.config import settings


def generate_whatsapp_link(phone: str, message: str) -> str:
    """
    Generate a WhatsApp click-to-chat link
    
    Args:
        phone: Phone number (with country code, no + sign)
        message: Message to pre-fill
        
    Returns:
        WhatsApp URL string
    """
    # Clean phone number - remove spaces, dashes, and + sign
    clean_phone = ''.join(filter(str.isdigit, phone))
    
    # Ensure phone has country code
    if not clean_phone.startswith('91'):
        clean_phone = '91' + clean_phone
    
    # URL encode the message
    encoded_message = quote(message)
    
    return f"https://wa.me/{clean_phone}?text={encoded_message}"


def generate_product_enquiry_link(
    product_name: str,
    product_brand: Optional[str] = None
) -> str:
    """
    Generate a WhatsApp link for product enquiry
    
    Args:
        product_name: Name of the product
        product_brand: Brand of the product
        
    Returns:
        WhatsApp URL string
    """
    brand_text = f" ({product_brand})" if product_brand else ""
    
    message = f"""Hi! I'm interested in the following product from {settings.business_name}:

📦 Product: {product_name}{brand_text}

Please provide more details about:
- Price
- Availability
- Delivery options

Thank you!"""
    
    return generate_whatsapp_link(settings.whatsapp_business_phone, message)


def generate_invoice_share_link(
    customer_phone: str,
    invoice_number: str,
    total_amount: float,
    pdf_url: Optional[str] = None
) -> str:
    """
    Generate a WhatsApp link to share invoice with customer
    
    Args:
        customer_phone: Customer's phone number
        invoice_number: Invoice number
        total_amount: Total invoice amount
        pdf_url: Optional URL to PDF invoice
        
    Returns:
        WhatsApp URL string
    """
    message = f"""🧾 *Invoice from {settings.business_name}*

Invoice Number: {invoice_number}
Total Amount: ₹{total_amount:,.2f}

Thank you for your business!
For any queries, please contact us at {settings.business_phone}.

{settings.business_name}
{settings.business_address}"""
    
    if pdf_url:
        message += f"\n\nView Invoice: {pdf_url}"
    
    return generate_whatsapp_link(customer_phone, message)


async def send_whatsapp_message(
    phone: str,
    message: str
) -> dict:
    """
    Mock function to send WhatsApp message
    In production, this would integrate with WhatsApp Business API
    
    Args:
        phone: Recipient phone number
        message: Message content
        
    Returns:
        Mock response dictionary
    """
    # This is a mock implementation
    # In production, integrate with:
    # - WhatsApp Business API
    # - Twilio WhatsApp
    # - Other WhatsApp service providers
    
    whatsapp_link = generate_whatsapp_link(phone, message)
    
    return {
        "success": True,
        "message": "WhatsApp message prepared",
        "whatsapp_link": whatsapp_link,
        "note": "This is a mock implementation. Open the link to send via WhatsApp Web."
    }


async def send_invoice_via_whatsapp(
    customer_phone: str,
    invoice_number: str,
    total_amount: float,
    pdf_url: Optional[str] = None
) -> dict:
    """
    Mock function to send invoice via WhatsApp
    
    Args:
        customer_phone: Customer's phone number
        invoice_number: Invoice number
        total_amount: Total invoice amount
        pdf_url: Optional URL to PDF invoice
        
    Returns:
        Mock response dictionary
    """
    whatsapp_link = generate_invoice_share_link(
        customer_phone,
        invoice_number,
        total_amount,
        pdf_url
    )
    
    return {
        "success": True,
        "message": "Invoice WhatsApp message prepared",
        "whatsapp_link": whatsapp_link,
        "invoice_number": invoice_number,
        "note": "Click the link to open WhatsApp and send the invoice details."
    }
