"""FastAPI application entry point."""
{{#if values.framework == "fastapi"}}
from fastapi import FastAPI
{{#if values.enableCors}}
from fastapi.middleware.cors import CORSMiddleware
{{/if}}
{{#if values.enableSwagger}}
from fastapi.openapi.utils import get_openapi
{{/if}}
from loguru import logger

from src.config import settings
from src.routes import api_router

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="${{ values.description }}",
    {{#if values.enableSwagger}}
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    {{else}}
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
    {{/if}}
)

{{#if values.enableCors}}
# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
{{/if}}

# Include routers
app.include_router(api_router, prefix=f"/api/{settings.api_version}")

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.app_name}",
        "version": "1.0.0",
        "docs": "/docs" if settings.debug else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=settings.port,
        reload=settings.debug,
        log_level=settings.log_level.lower()
    )
{{else}}
# This file is for FastAPI only
# For Flask, use src/app.py instead
pass
{{/if}}

