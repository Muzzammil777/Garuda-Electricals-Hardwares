"""
Configuration settings for Garuda Electricals & Hardwares Backend
Loads environment variables and provides application settings
"""

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application Settings
    app_name: str = "Garuda Electricals & Hardwares"
    app_env: str = "development"
    debug: bool = True
    
    # Server Settings
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Supabase Configuration
    supabase_url: str
    supabase_key: str
    supabase_service_key: str
    
    # JWT Configuration
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 1440  # 24 hours
    
    # CORS Settings - Allow all origins in production (Vercel frontend)
    cors_origins: str = "*"
    
    # Business Information
    business_name: str = "Garuda Electricals & Hardwares"
    business_address: str = "No 51/1, Near Trichy Main Road, Gandhigramam, Karur-639004, Tamil Nadu"
    business_phone: str = "+919876543210"
    business_email: str = "contact@garudaelectricals.com"
    business_gst: str = "33XXXXX1234X1Z5"
    
    # WhatsApp Configuration
    whatsapp_api_url: str = "https://api.whatsapp.com/send"
    whatsapp_business_phone: str = "919876543210"
    
    # Email Configuration (Brevo API)
    brevo_api_key: str = ""  # Brevo API key from https://brevo.com
    email_address: str = "Garudaelectricals@gmail.com"
    email_sender_name: str = "Garuda Electricals & Hardwares"
    
    # Password Reset Configuration
    password_reset_token_expire_minutes: int = 30
    frontend_reset_url: str = "http://localhost:3000/reset-password"
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins string into list"""
        return [origin.strip() for origin in self.cors_origins.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Export settings instance
settings = get_settings()
