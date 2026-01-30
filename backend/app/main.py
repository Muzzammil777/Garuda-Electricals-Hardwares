"""
Garuda Electricals & Hardwares - Backend API
Main FastAPI Application Entry Point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.routers import auth, categories, products, customers, invoices, offers, contact, dashboard, settings as settings_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler"""
    # Startup
    print(f"🚀 Starting {settings.app_name} API...")
    print(f"📍 Environment: {settings.app_env}")
    yield
    # Shutdown
    print(f"👋 Shutting down {settings.app_name} API...")


# Create FastAPI application
app = FastAPI(
    title=settings.app_name,
    description="""
    ## Garuda Electricals & Hardwares API
    
    Backend API for the Garuda Electricals & Hardwares business management system.
    
    ### Features
    - 🔐 Authentication with JWT
    - 📦 Product & Category Management
    - 👥 Customer Management
    - 🧾 Invoice Generation with PDF
    - 📢 Offers Management
    - 💬 Contact Form
    - 📊 Dashboard Analytics
    
    ### Business Information
    
    **Garuda Electricals & Hardwares**  
    No 51/1, Near Trichy Main Road, Gandhigramam, Karur-639004, Tamil Nadu  
    *Serving customers since 2009*
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
cors_origins = [
    "http://localhost:3000",  # Local development
    "http://localhost:5173",  # Vite dev server
    "https://garuda-electricals.in",  # Production domain
    "https://www.garuda-electricals.in",  # www subdomain
    "https://garuda-electricals-hardwares.vercel.app",  # Vercel deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=False,  # Changed to False to work with proper CORS
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=600,  # Cache preflight for 10 minutes
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(categories.router, prefix="/api")
app.include_router(products.router, prefix="/api")
app.include_router(customers.router, prefix="/api")
app.include_router(invoices.router, prefix="/api")
app.include_router(offers.router, prefix="/api")
app.include_router(contact.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(settings_router.router, prefix="/api")


@app.get("/")
async def root():
    """Root endpoint - API welcome message"""
    return {
        "message": f"Welcome to {settings.app_name} API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "app": settings.app_name,
        "environment": settings.app_env
    }


@app.get("/api/business-info")
async def get_business_info():
    """Get business information"""
    return {
        "name": settings.business_name,
        "address": settings.business_address,
        "phone": settings.business_phone,
        "email": settings.business_email,
        "gst": settings.business_gst,
        "whatsapp": settings.whatsapp_business_phone,
        "established": 2009,
        "description": "Garuda Electricals & Hardwares in Gandhigramam, Karur is known to satisfactorily cater to the demands of its customer base. The business came into existence in 2009 and has, since then, been a known name in its field."
    }


# Run with: uvicorn app.main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug
    )
