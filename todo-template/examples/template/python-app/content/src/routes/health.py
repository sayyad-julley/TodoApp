"""Health check routes."""
{{#if values.framework == "fastapi"}}
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}
{{else}}
from flask import Blueprint, jsonify

health_bp = Blueprint("health", __name__)

@health_bp.route("/health")
def health():
    """Health check endpoint."""
    return jsonify({"status": "ok"}), 200
{{/if}}

