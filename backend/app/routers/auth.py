"""
Authentication Router
Handles user login, registration, and token management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client
from app.database import get_db
from app.schemas.user import UserLogin, Token, UserResponse, UserCreate
from app.utils.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user,
    get_current_active_admin
)
from app.config import settings
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
async def login(user_data: UserLogin, db: Client = Depends(get_db)):
    """
    Authenticate user and return JWT token
    
    Args:
        user_data: Email and password
        db: Database client
        
    Returns:
        JWT access token and user info
    """
    # Find user by email
    result = db.table("users").select("*").eq("email", user_data.email).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = result.data[0]
    
    # Verify password
    if not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is active
    if not user.get("is_active"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is disabled",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user["id"], "email": user["email"]})
    
    # Prepare user response
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        is_active=user["is_active"],
        created_at=user["created_at"],
        updated_at=user["updated_at"]
    )
    
    return {"access_token": access_token, "token_type": "bearer", "user": user_response.dict()}


@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: Client = Depends(get_db),
    current_admin: dict = Depends(get_current_active_admin)
):
    """
    Register a new admin user (only existing admins can create new admins)
    
    Args:
        user_data: New user data
        db: Database client
        current_admin: Current authenticated admin
        
    Returns:
        Created user info
    """
    # Check if email already exists
    existing = db.table("users").select("id").eq("email", user_data.email).execute()
    
    if existing.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = get_password_hash(user_data.password)
    
    # Create user
    new_user = {
        "email": user_data.email,
        "password_hash": password_hash,
        "full_name": user_data.full_name,
        "role": user_data.role
    }
    
    result = db.table("users").insert(new_user).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )
    
    user = result.data[0]
    
    return UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        role=user["role"],
        is_active=user["is_active"],
        created_at=user["created_at"],
        updated_at=user["updated_at"]
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user info
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        User info
    """
    return UserResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"],
        is_active=current_user["is_active"],
        created_at=current_user["created_at"],
        updated_at=current_user["updated_at"]
    )


@router.post("/change-password")
async def change_password(
    old_password: str,
    new_password: str,
    db: Client = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    Change current user's password
    
    Args:
        old_password: Current password
        new_password: New password
        db: Database client
        current_user: Current authenticated user
        
    Returns:
        Success message
    """
    # Verify old password
    if not verify_password(old_password, current_user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect current password"
        )
    
    # Hash new password
    new_password_hash = get_password_hash(new_password)
    
    # Update password
    db.table("users").update({"password_hash": new_password_hash}).eq("id", current_user["id"]).execute()
    
    return {"message": "Password changed successfully"}

