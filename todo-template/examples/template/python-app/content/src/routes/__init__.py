"""API routes."""
{{#if values.framework == "fastapi"}}
from fastapi import APIRouter
from src.routes.health import router as health_router
from src.routes.api import router as main_api_router

api_router = APIRouter()
api_router.include_router(health_router, tags=["health"])
api_router.include_router(main_api_router, tags=["api"])
{{else}}
from src.config import config

def register_routes(app):
    """Register all routes with the Flask app."""
    from src.routes.health import health_bp
    from src.routes.api import api_bp
    
    app.register_blueprint(health_bp)
    app.register_blueprint(api_bp, url_prefix=f"/api/{config.API_VERSION}")
{{/if}}

