# Forgot Password Feature - Setup Guide

## Overview
The forgot password feature has been successfully implemented in your application. When users click "Forgot Password" on the login page, they'll receive an email with a link to reset their password.

## What Was Added

### Backend Changes

#### 1. Database Schema Update (`database/schema.sql`)
- Added `password_reset_tokens` table to store password reset tokens with expiration
- Tokens are automatically marked as used after successful password reset
- Tokens expire after 30 minutes

#### 2. Configuration (`backend/app/config.py`)
Added new email configuration settings:
- `smtp_server`: Gmail SMTP server (smtp.gmail.com)
- `smtp_port`: Port 587 for TLS encryption
- `email_address`: Garuda Electricals email (Garudaelectricals@gmail.com)
- `email_password`: App-specific password (needs to be set in .env)
- `email_sender_name`: Display name for emails
- `password_reset_token_expire_minutes`: Token expiration time (30 minutes)
- `frontend_reset_url`: URL for password reset link

#### 3. Email Utilities (`backend/app/utils/email.py`)
- `send_email()`: Generic email sending function using Gmail SMTP
- `send_password_reset_email()`: Sends formatted password reset email with reset link
- Professional HTML email template with company branding

#### 4. Authentication Endpoints (`backend/app/routers/auth.py`)
New endpoints added:

**POST `/auth/forgot-password`**
- Request: `{ "email": "user@example.com" }`
- Response: Success message (doesn't reveal if email exists for security)
- Action: Generates reset token and sends email

**POST `/auth/reset-password`**
- Request: `{ "token": "reset_token", "new_password": "new_password" }`
- Response: Success message and login instructions
- Action: Validates token, updates password, marks token as used

### Frontend Changes

#### 1. Login Page Update (`frontend/src/pages/admin/Login.jsx`)
- Added "Forgot your password?" link
- Added forgot password modal with email input
- Calls `/auth/forgot-password` endpoint
- Shows success toast notification

#### 2. Reset Password Page (`frontend/src/pages/admin/ResetPassword.jsx`)
- New page accessible via `/reset-password?token=xxx`
- Validates password strength (minimum 8 characters)
- Confirms password matches
- Shows success message after reset
- Auto-redirects to login after 2 seconds

#### 3. App Routes Update (`frontend/src/App.jsx`)
- Added route: `/reset-password` → ResetPassword component
- Added route: `/admin` → Login component (redirects to login)

## Setup Instructions

### Step 1: Update Database
1. Log in to your Supabase dashboard
2. Go to the SQL Editor
3. Copy the new schema changes from `database/schema.sql` (the password_reset_tokens table section)
4. Execute the SQL to create the password reset tokens table

Alternatively, if you're using migrations, update your schema.sql file.

### Step 2: Configure Environment Variables

Add these to your `.env` file in the backend root:

```env
# Email Configuration (Gmail SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
EMAIL_ADDRESS=Garudaelectricals@gmail.com
EMAIL_PASSWORD=your_app_password_here
EMAIL_SENDER_NAME=Garuda Electricals & Hardwares

# Password Reset Configuration
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES=30
FRONTEND_RESET_URL=https://yourdomain.com/reset-password
```

### Step 3: Gmail App Password Setup

Since Gmail doesn't allow direct SMTP login with regular passwords:

1. Enable 2-Factor Authentication on your Gmail account
2. Go to myaccount.google.com → Security
3. Find "App passwords" (only visible with 2FA enabled)
4. Create a new app password for "Mail" and "Windows Computer"
5. Copy the 16-character password provided
6. Add it to your `.env` as `EMAIL_PASSWORD`

Example app password format: `abcd efgh ijkl mnop`

### Step 4: Update Frontend Reset URL (if needed)

If your frontend is hosted at a different URL:
1. Update `frontend_reset_url` in `backend/app/config.py` or in `.env`
2. Default is: `http://localhost:3000/reset-password`
3. For production: Update to your production URL

### Step 5: Test the Feature

1. Start both backend and frontend servers
2. Go to `/admin/login` (or `/admin`)
3. Click "Forgot your password?"
4. Enter your admin email
5. Check your email for the reset link
6. Click the link to go to reset password page
7. Enter new password and confirm
8. Login with new password

## Security Features Implemented

✅ **Token-based Reset**: Uses secure random tokens instead of email links
✅ **Token Expiration**: Tokens expire after 30 minutes
✅ **One-time Use**: Tokens can only be used once
✅ **Password Hashing**: All passwords are hashed with bcrypt
✅ **Email Verification**: Email is sent before allowing password change
✅ **Rate Limiting Ready**: Backend structure supports rate limiting
✅ **No User Enumeration**: Doesn't reveal if email exists in system

## File Changes Summary

### New Files Created:
- `backend/app/utils/email.py` - Email sending utilities
- `frontend/src/pages/admin/ResetPassword.jsx` - Reset password page

### Modified Files:
- `database/schema.sql` - Added password_reset_tokens table
- `backend/app/config.py` - Added email configuration settings
- `backend/app/routers/auth.py` - Added forgot/reset password endpoints
- `frontend/src/pages/admin/Login.jsx` - Added forgot password modal
- `frontend/src/App.jsx` - Added reset password route

## Troubleshooting

### Email Not Sending
- Check that `email_password` is correctly set in `.env`
- Verify Gmail app password was created correctly (not regular password)
- Check that 2FA is enabled on Gmail account
- Verify SMTP settings: server=smtp.gmail.com, port=587

### Token Validation Error
- Token may have expired (30 minute limit)
- User should request a new password reset
- Check database that password_reset_tokens table exists

### Frontend Not Showing Reset Page
- Verify `/reset-password` route is added in App.jsx
- Check browser console for any errors
- Ensure token parameter is in URL: `/reset-password?token=xxx`

## Future Enhancements

Consider adding:
- Rate limiting on forgot password endpoint
- Email templates customization
- SMS backup for password reset
- Account recovery with security questions
- Notification of password change to user's email
- Admin notification when passwords are reset

---

**Feature Created**: Forgot Password with Email Reset
**Date**: January 29, 2026
**Status**: ✅ Ready to Deploy
