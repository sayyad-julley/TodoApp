"""Flask application entry point."""
{{#if values.framework == "flask"}}
from flask import Flask
{{#if values.enableCors}}
from flask_cors import CORS
{{/if}}
from loguru import logger

from src.config import config
from src.routes import register_routes

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(config)

{{#if values.enableCors}}
# Configure CORS
CORS(app, origins=config.CORS_ORIGINS)
{{/if}}

# Register routes
register_routes(app)

# Health check endpoint
@app.route("/health")
def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": config.APP_NAME,
        "version": "1.0.0"
    }, 200

@app.route("/")
def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {config.APP_NAME}",
        "version": "1.0.0"
    }, 200

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=config.PORT,
        debug=config.DEBUG
    )
{{else}}
# This file is for Flask only
# For FastAPI, use src/main.py instead
pass
{{/if}}

