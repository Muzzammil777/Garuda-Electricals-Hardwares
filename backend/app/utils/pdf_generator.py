"""
PDF Invoice Generator
Creates professional PDF invoices using ReportLab
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from io import BytesIO
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any
from app.config import settings
import os


def format_currency(amount):
    """Format amount as INR currency"""
    try:
        amt = float(amount) if amount else 0
        return f"Rs. {amt:,.2f}"
    except:
        return "Rs. 0.00"


def generate_invoice_pdf(invoice_data: Dict[str, Any]) -> BytesIO:
    """
    Generate a PDF invoice
    
    Args:
        invoice_data: Dictionary containing invoice details
        
    Returns:
        BytesIO buffer containing the PDF
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=1.5*cm,
        bottomMargin=1.5*cm
    )
    
    # Get styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=12,
        textColor=colors.HexColor('#1e40af'),
        alignment=TA_CENTER
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.gray,
        alignment=TA_CENTER
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=12,
        spaceAfter=6,
        textColor=colors.HexColor('#1e40af')
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=4
    )
    
    # Build the document elements
    elements = []
    
    # ===== HEADER SECTION =====
    elements.append(Paragraph(settings.business_name, title_style))
    elements.append(Paragraph(settings.business_address, subtitle_style))
    elements.append(Paragraph(f"Phone: {settings.business_phone} | Email: {settings.business_email}", subtitle_style))
    elements.append(Paragraph(f"GSTIN: {settings.business_gst}", subtitle_style))
    elements.append(Spacer(1, 0.5*cm))
    
    # Divider line
    elements.append(Table(
        [['']],
        colWidths=[18*cm],
        style=TableStyle([
            ('LINEBELOW', (0, 0), (-1, -1), 2, colors.HexColor('#1e40af')),
        ])
    ))
    elements.append(Spacer(1, 0.3*cm))
    
    # ===== INVOICE DETAILS =====
    elements.append(Paragraph("TAX INVOICE", ParagraphStyle(
        'InvoiceTitle',
        parent=styles['Heading1'],
        fontSize=18,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#f59e0b')
    )))
    elements.append(Spacer(1, 0.3*cm))
    
    # Invoice info table
    invoice_info = [
        [
            Paragraph("<b>Invoice Number:</b>", normal_style),
            Paragraph(invoice_data.get('invoice_number', 'N/A'), normal_style),
            Paragraph("<b>Invoice Date:</b>", normal_style),
            Paragraph(str(invoice_data.get('invoice_date', 'N/A')), normal_style),
        ],
        [
            Paragraph("<b>Due Date:</b>", normal_style),
            Paragraph(str(invoice_data.get('due_date', 'N/A')), normal_style),
            Paragraph("<b>Status:</b>", normal_style),
            Paragraph(invoice_data.get('payment_status', 'Pending').upper(), normal_style),
        ]
    ]
    
    invoice_table = Table(invoice_info, colWidths=[3.5*cm, 5*cm, 3.5*cm, 5*cm])
    invoice_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(invoice_table)
    elements.append(Spacer(1, 0.5*cm))
    
    # ===== CUSTOMER DETAILS =====
    elements.append(Paragraph("Bill To:", heading_style))
    
    customer_name = invoice_data.get('customer_name', 'N/A')
    customer_phone = invoice_data.get('customer_phone', '')
    customer_address = invoice_data.get('customer_address', '')
    customer_gst = invoice_data.get('customer_gst', '')
    
    customer_info = f"""
    <b>{customer_name}</b><br/>
    {customer_address}<br/>
    Phone: {customer_phone}<br/>
    {'GSTIN: ' + customer_gst if customer_gst else ''}
    """
    elements.append(Paragraph(customer_info, normal_style))
    elements.append(Spacer(1, 0.5*cm))
    
    # ===== ITEMS TABLE =====
    items = invoice_data.get('items', [])
    
    # Table header
    table_data = [
        [
            Paragraph('<b>S.No</b>', normal_style),
            Paragraph('<b>Item Description</b>', normal_style),
            Paragraph('<b>Qty</b>', normal_style),
            Paragraph('<b>Unit</b>', normal_style),
            Paragraph('<b>Rate</b>', normal_style),
            Paragraph('<b>Tax %</b>', normal_style),
            Paragraph('<b>Amount</b>', normal_style),
        ]
    ]
    
    # Table rows
    for i, item in enumerate(items, 1):
        qty = float(item.get('quantity', 0))
        unit_price = float(item.get('unit_price', 0))
        tax_rate = float(item.get('tax_rate', 0))
        total = float(item.get('total_amount', qty * unit_price))
        
        row = [
            Paragraph(str(i), normal_style),
            Paragraph(str(item.get('product_name', '')), normal_style),
            Paragraph(f"{qty:.0f}", normal_style),
            Paragraph(str(item.get('unit', 'piece')), normal_style),
            Paragraph(format_currency(unit_price), normal_style),
            Paragraph(f"{tax_rate:.1f}%", normal_style),
            Paragraph(format_currency(total), normal_style),
        ]
        table_data.append(row)
    
    # Create items table
    items_table = Table(
        table_data,
        colWidths=[1.2*cm, 6*cm, 1.5*cm, 1.5*cm, 2.8*cm, 1.5*cm, 3.5*cm]
    )
    
    items_table.setStyle(TableStyle([
        # Header styling
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        
        # Body styling
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        
        # Grid
        ('GRID', (0, 0), (-1, -1), 0.5, colors.gray),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        
        # Alternating row colors
        *[('BACKGROUND', (0, i), (-1, i), colors.HexColor('#f3f4f6')) 
          for i in range(2, len(table_data), 2)],
    ]))
    
    elements.append(items_table)
    elements.append(Spacer(1, 0.5*cm))
    
    # ===== TOTALS SECTION =====
    subtotal = float(invoice_data.get('subtotal', 0) or 0)
    tax_amount = float(invoice_data.get('tax_amount', 0) or 0)
    discount_amount = float(invoice_data.get('discount_amount', 0) or 0)
    total_amount = float(invoice_data.get('total_amount', 0) or 0)
    
    # Right-aligned totals table
    right_style = ParagraphStyle(
        'RightAlign',
        parent=styles['Normal'],
        fontSize=10,
        alignment=TA_RIGHT
    )
    
    totals_data = [
        [Paragraph('<b>Subtotal:</b>', right_style), Paragraph(format_currency(subtotal), right_style)],
        [Paragraph('<b>Tax:</b>', right_style), Paragraph(format_currency(tax_amount), right_style)],
        [Paragraph('<b>Discount:</b>', right_style), Paragraph(f"-{format_currency(discount_amount)}", right_style)],
    ]
    
    totals_table = Table(
        totals_data,
        colWidths=[14*cm, 4*cm]
    )
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(totals_table)
    
    # Grand total
    grand_style = ParagraphStyle(
        'GrandTotal',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor('#1e40af'),
        alignment=TA_RIGHT
    )
    
    grand_total_data = [
        [Paragraph('<b>GRAND TOTAL:</b>', grand_style), Paragraph(f"<b>{format_currency(total_amount)}</b>", grand_style)],
    ]
    
    grand_total_table = Table(
        grand_total_data,
        colWidths=[14*cm, 4*cm]
    )
    grand_total_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('LINEABOVE', (0, 0), (-1, 0), 2, colors.HexColor('#1e40af')),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#eff6ff')),
    ]))
    elements.append(grand_total_table)
    elements.append(Spacer(1, 1*cm))
    
    # ===== NOTES SECTION =====
    notes = invoice_data.get('notes', '')
    if notes:
        elements.append(Paragraph("Notes:", heading_style))
        elements.append(Paragraph(notes, normal_style))
        elements.append(Spacer(1, 0.5*cm))
    
    # ===== FOOTER =====
    elements.append(Spacer(1, 1*cm))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.gray,
        alignment=TA_CENTER
    )
    elements.append(Paragraph("Thank you for your business!", footer_style))
    elements.append(Paragraph(f"Generated on {datetime.now().strftime('%d-%m-%Y %H:%M')}", footer_style))
    
    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    return buffer


def generate_invoice_number(last_number: int = 0) -> str:
    """
    Generate a new invoice number
    
    Args:
        last_number: Last invoice number used
        
    Returns:
        New invoice number string
    """
    current_year = datetime.now().year
    new_number = last_number + 1
    return f"GEH-{current_year}-{new_number:05d}"
