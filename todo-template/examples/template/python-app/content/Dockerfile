{{#if values.enableDocker}}
# Use Python ${{ values.pythonVersion }} slim image
FROM python:${{ values.pythonVersion }}-slim

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && \
    pip install -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE ${{ values.port }}

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:${{ values.port }}/health')"

# Run the application
{{#if values.framework == "fastapi"}}
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "${{ values.port }}"]
{{else}}
CMD ["python", "src/app.py"]
{{/if}}
{{/if}}

