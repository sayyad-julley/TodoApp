"""Main API routes."""
{{#if values.framework == "fastapi"}}
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def api_root():
    """API root endpoint."""
    return {"message": "API is running", "version": "1.0.0"}

@router.get("/example")
async def example():
    """Example endpoint."""
    return {"data": "This is an example endpoint"}
{{else}}
from flask import Blueprint, jsonify

api_bp = Blueprint("api", __name__)

@api_bp.route("/")
def api_root():
    """API root endpoint."""
    return jsonify({"message": "API is running", "version": "1.0.0"}), 200

@api_bp.route("/example")
def example():
    """Example endpoint."""
    return jsonify({"data": "This is an example endpoint"}), 200
{{/if}}

