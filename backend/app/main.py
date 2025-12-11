from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from .core import settings, init_db
from .api import auth, buyers, suppliers, samples, operations, orders, contacts, health, materials, users
from .core.logging import setup_logging
import traceback

# Configure logging
logger = setup_logging()


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)


# Set up CORS
# For local network access, allow all origins (restrict in production)
cors_origins = settings.BACKEND_CORS_ORIGINS.copy()
if settings.ENVIRONMENT == "development":
    # In development, allow all local network IPs
    cors_origins.append("*")  # Allow all origins for local network access

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if "*" not in cors_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler for unhandled exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler that catches all unhandled exceptions.
    Logs the error details and returns a generic 500 response.
    """
    # Log the full error with traceback
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)}\n"
        f"Request: {request.method} {request.url}\n"
        f"Traceback: {traceback.format_exc()}"
    )

    # Return a generic error response (don't expose internal details)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Please try again later.",
            "error_type": type(exc).__name__
        }
    )


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    logger.info("Initializing database...")
    init_db()
    logger.info("Database initialized successfully!")

    # Initialize sample data
    from .core.database import SessionLocal
    from .init_data import init_sample_data
    db = SessionLocal()
    try:
        init_sample_data(db)
    finally:
        db.close()


@app.get("/")
async def root():
    return {
        "message": "Welcome to Southern Apparels and Holdings ERP API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(buyers.router, prefix=f"{settings.API_V1_STR}/buyers", tags=["buyers"])
app.include_router(suppliers.router, prefix=f"{settings.API_V1_STR}/suppliers", tags=["suppliers"])
app.include_router(samples.router, prefix=f"{settings.API_V1_STR}/samples", tags=["samples"])
app.include_router(operations.router, prefix=f"{settings.API_V1_STR}/operations", tags=["operations"])
app.include_router(orders.router, prefix=f"{settings.API_V1_STR}/orders", tags=["orders"])
app.include_router(contacts.router, prefix=f"{settings.API_V1_STR}/contacts", tags=["contacts"])
app.include_router(materials.router, prefix=f"{settings.API_V1_STR}", tags=["materials"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(health.router, prefix=f"{settings.API_V1_STR}", tags=["health"])
