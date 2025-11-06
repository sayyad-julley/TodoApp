# ${{ values.__APP_NAME__ }}

${{ values.description }}

## Features

- **Framework**: ${{ values.framework | upper }}
- **Python Version**: ${{ values.pythonVersion }}
- **Port**: ${{ values.port }}
{{#if values.enableAuth}}
- **Authentication**: JWT-based authentication
{{/if}}
{{#if values.enableCors}}
- **CORS**: Enabled
{{/if}}
{{#if values.enableRateLimit}}
- **Rate Limiting**: Enabled
{{/if}}
{{#if values.enableSwagger}}
- **API Documentation**: Swagger/OpenAPI
{{/if}}
{{#if values.databaseType}}
- **Database**: ${{ values.databaseType }}
{{/if}}
{{#if values.enableTesting}}
- **Testing**: pytest
{{/if}}
{{#if values.enableDocker}}
- **Docker**: Containerized
{{/if}}

## Getting Started

### Prerequisites

- Python ${{ values.pythonVersion }}
- pip or poetry

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ${{ values.name }}
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

{{#if values.databaseType}}
4. Set up the database:
```bash
# Update .env with your database connection string
{{#if values.enableMigrations}}
# Run migrations
alembic upgrade head
{{/if}}
{{#if values.enableSeeding}}
# Seed the database
python scripts/seed.py
{{/if}}
{{/if}}

5. Run the application:
```bash
{{#if values.framework == "fastapi"}}
uvicorn src.main:app --reload --port ${{ values.port }}
{{else}}
python src/app.py
{{/if}}
```

{{#if values.enableSwagger}}
6. Access the API documentation:
   - Swagger UI: http://localhost:${{ values.port }}/docs
   - ReDoc: http://localhost:${{ values.port }}/redoc
{{/if}}

## Project Structure

```
${{ values.name }}/
├── src/
│   ├── __init__.py
│   ├── main.py          # FastAPI entry point
│   ├── app.py           # Flask entry point
│   ├── config.py         # Configuration
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   └── utils/           # Utility functions
{{#if values.databaseType}}
├── alembic/             # Database migrations
{{/if}}
{{#if values.enableTesting}}
├── tests/               # Test files
{{/if}}
├── requirements.txt     # Python dependencies
{{#if values.enableDocker}}
├── Dockerfile           # Docker configuration
{{/if}}
└── README.md           # This file
```

## Development

{{#if values.enableTesting}}
### Running Tests

```bash
pytest
```

With coverage:
```bash
pytest --cov=src --cov-report=html
```
{{/if}}

### Code Quality

```bash
# Format code
black src/

# Lint code
flake8 src/

# Type checking
mypy src/
```

{{#if values.enableDocker}}
## Docker

### Build the image:
```bash
docker build -t ${{ values.name }} .
```

### Run the container:
```bash
docker run -p ${{ values.port }}:${{ values.port }} ${{ values.name }}
```
{{/if}}

## API Endpoints

{{#if values.framework == "fastapi"}}
The API documentation is automatically available at `/docs` when the application is running.
{{else}}
See the API documentation in `docs/api.md` for detailed endpoint information.
{{/if}}

## License

MIT License

