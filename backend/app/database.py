"""
Database connection module for Supabase
Provides Supabase client instances for database operations
"""

from supabase import create_client, Client
from app.config import settings
import httpx


# Create clients without caching to avoid stale connections
_supabase_client = None
_supabase_admin_client = None


def get_supabase_client() -> Client:
    """
    Get Supabase client with anon key (for public operations)
    Creates fresh connection if needed
    """
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = create_client(settings.supabase_url, settings.supabase_key)
    return _supabase_client


def get_supabase_admin_client() -> Client:
    """
    Get Supabase client with service role key (for admin operations)
    This bypasses Row Level Security
    Creates fresh connection if needed
    """
    global _supabase_admin_client
    if _supabase_admin_client is None:
        _supabase_admin_client = create_client(settings.supabase_url, settings.supabase_service_key)
    return _supabase_admin_client


def reset_connections():
    """Reset all database connections (useful after connection errors)"""
    global _supabase_client, _supabase_admin_client
    _supabase_client = None
    _supabase_admin_client = None


def get_fresh_admin_client() -> Client:
    """Get a completely fresh Supabase admin client (no caching)"""
    return create_client(settings.supabase_url, settings.supabase_service_key)


def get_db() -> Client:
    """Dependency injection for database client"""
    return get_supabase_admin_client()
