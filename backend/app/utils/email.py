"""
Email utilities for sending password reset and other emails using Resend
"""

import resend
from app.config import settings
from typing import Optional


def send_password_reset_email(reset_token: str, recipient_email: str = "Garudaelectricals@gmail.com") -> bool:
    """
    Send password reset email with reset link using Resend
    
    Args:
        reset_token: The password reset token
        recipient_email: Email address to send to (default: Garudaelectricals@gmail.com)
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        # Set API key
        resend.api_key = settings.resend_api_key
        
        # Create reset link
        reset_link = f"{settings.frontend_reset_url}?token={reset_token}"
        
        # Create HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
                    color: white;
                    padding: 30px;
                    text-align: center;
                    border-radius: 8px 8px 0 0;
                }}
                .content {{
                    background: #f9fafb;
                    padding: 30px;
                    border-radius: 0 0 8px 8px;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 30px;
                    background: #2563eb;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    margin: 20px 0;
                }}
                .footer {{
                    text-align: center;
                    margin-top: 20px;
                    color: #6b7280;
                    font-size: 12px;
                }}
                .warning {{
                    background: #fef2f2;
                    border-left: 4px solid #ef4444;
                    padding: 12px;
                    margin: 15px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">Garuda Electricals & Hardwares</h1>
                    <p style="margin: 10px 0 0 0;">Admin Password Reset</p>
                </div>
                <div class="content">
                    <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
                    <p>Hello Admin,</p>
                    <p>You have requested to reset your password for the Garuda Electricals & Hardwares admin panel.</p>
                    <p>Click the button below to reset your password:</p>
                    <div style="text-align: center;">
                        <a href="{reset_link}" class="button">Reset Password</a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px;">Or copy and paste this link in your browser:</p>
                    <p style="background: white; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px;">
                        {reset_link}
                    </p>
                    <div class="warning">
                        <strong>⚠️ Important:</strong> This link will expire in {settings.password_reset_token_expire_minutes} minutes for security reasons.
                    </div>
                    <p style="margin-top: 20px;">If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
                    <p>Best regards,<br>Garuda Electricals & Hardwares Team</p>
                </div>
                <div class="footer">
                    <p>{settings.business_address}</p>
                    <p>Phone: {settings.business_phone} | Email: {settings.business_email}</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Send email using Resend
        params = {
            "from": f"{settings.email_sender_name} <{settings.email_from}>",
            "to": [recipient_email],
            "subject": "Password Reset Request - Garuda Electricals",
            "html": html_content,
        }
        
        email = resend.Emails.send(params)
        print(f"Email sent successfully via Resend. ID: {email.get('id')}")
        return True
        
    except Exception as e:
        print(f"Error sending email via Resend: {str(e)}")
        return False


def send_email(
    subject: str,
    recipient: str,
    html_content: str,
    text_content: Optional[str] = None
) -> bool:
    """
    Generic email sending utility using Resend
    
    Args:
        subject: Email subject
        recipient: Recipient email address
        html_content: HTML email content
        text_content: Optional plain text email content
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        resend.api_key = settings.resend_api_key
        
        params = {
            "from": f"{settings.email_sender_name} <{settings.email_from}>",
            "to": [recipient],
            "subject": subject,
            "html": html_content,
        }
        
        if text_content:
            params["text"] = text_content
        
        email = resend.Emails.send(params)
        print(f"Email sent successfully via Resend. ID: {email.get('id')}")
        return True
        
    except Exception as e:
        print(f"Error sending email via Resend: {str(e)}")
        return False

