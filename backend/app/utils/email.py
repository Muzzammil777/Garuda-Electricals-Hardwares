"""
Email utilities
Send emails using Brevo API (transactional email service)
"""

import httpx
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Brevo API Configuration
BREVO_API_URL = "https://api.brevo.com/v3/smtp/email"


def send_email(to_email: str, subject: str, html_content: str) -> bool:
    """
    Send email using Brevo API
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        
    Returns:
        True if email sent successfully, False otherwise
    """
    try:
        if not settings.brevo_api_key:
            logger.error("Brevo API key not configured")
            return False
        
        # Prepare email payload
        payload = {
            "to": [
                {
                    "email": to_email,
                    "name": to_email.split('@')[0]  # Extract name from email
                }
            ],
            "sender": {
                "email": settings.email_address,
                "name": settings.email_sender_name
            },
            "subject": subject,
            "htmlContent": html_content,
            "replyTo": {
                "email": settings.email_address,
                "name": settings.email_sender_name
            }
        }
        
        # Send via Brevo API
        headers = {
            "api-key": settings.brevo_api_key,
            "Content-Type": "application/json"
        }
        
        with httpx.Client(timeout=10.0) as client:
            response = client.post(BREVO_API_URL, json=payload, headers=headers)
        
        if response.status_code in [200, 201]:
            logger.info(f"Email sent successfully to {to_email}")
            return True
        else:
            logger.error(f"Brevo API error ({response.status_code}): {response.text}")
            return False
        
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_password_reset_email(to_email: str, reset_token: str, user_name: str = "") -> bool:
    """
    Send password reset email
    
    Args:
        to_email: User's email address
        reset_token: Password reset token
        user_name: User's full name (optional)
        
    Returns:
        True if email sent successfully, False otherwise
    """
    # Create reset link
    reset_link = f"{settings.frontend_reset_url}?token={reset_token}"
    
    # Create HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .container {{
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 30px;
                border: 1px solid #ddd;
            }}
            .header {{
                background-color: #2c5282;
                color: white;
                padding: 20px;
                border-radius: 8px 8px 0 0;
                margin: -30px -30px 30px -30px;
                text-align: center;
            }}
            .header h1 {{
                margin: 0;
                font-size: 24px;
            }}
            .content {{
                background-color: white;
                padding: 20px;
                border-radius: 4px;
            }}
            .button {{
                background-color: #2c5282;
                color: white;
                padding: 12px 30px;
                border-radius: 4px;
                text-decoration: none;
                display: inline-block;
                margin: 20px 0;
                font-weight: bold;
            }}
            .button:hover {{
                background-color: #1e3a5f;
            }}
            .footer {{
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 12px;
                color: #666;
                text-align: center;
            }}
            .warning {{
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                color: #856404;
                padding: 12px;
                border-radius: 4px;
                margin: 20px 0;
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hello {user_name if user_name else 'Admin'},</p>
                
                <p>We received a request to reset the password for your account. If you didn't request this, please ignore this email.</p>
                
                <p>To reset your password, click the button below:</p>
                
                <center>
                    <a href="{reset_link}" class="button">Reset Password</a>
                </center>
                
                <p>Or copy this link in your browser:</p>
                <p style="word-break: break-all; background-color: #f0f0f0; padding: 10px; border-radius: 4px;">
                    {reset_link}
                </p>
                
                <div class="warning">
                    <strong>⏱️ This link expires in 30 minutes.</strong> After that, you'll need to request a new password reset.
                </div>
                
                <p><strong>Security Reminder:</strong></p>
                <ul>
                    <li>Never share your password with anyone</li>
                    <li>Garuda Electricals staff will never ask for your password</li>
                    <li>If you didn't request this reset, your account may be at risk. Please contact us immediately</li>
                </ul>
            </div>
            <div class="footer">
                <p>© 2024 Garuda Electricals & Hardwares. All rights reserved.</p>
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>
                    <strong>Garuda Electricals & Hardwares</strong><br>
                    {settings.business_address}<br>
                    Phone: {settings.business_phone}<br>
                    Email: {settings.business_email}
                </p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(to_email, "Password Reset Request - Garuda Electricals", html_content)
