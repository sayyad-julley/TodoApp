"""Application configuration."""
import os
from typing import Optional
{{#if values.framework == "fastapi"}}
from pydantic_settings import BaseSettings
{{else}}
from dotenv import load_dotenv

load_dotenv()
{{/if}}


{{#if values.framework == "fastapi"}}
class Settings(BaseSettings):
    """Application settings."""
    
    app_name: str = "${{ values.__APP_NAME__ }}"
    app_env: str = os.getenv("APP_ENV", "development")
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    port: int = int(os.getenv("PORT", "${{ values.port }}"))
    api_version: str = os.getenv("API_VERSION", "${{ values.apiVersion }}")
    
    {{#if values.enableAuth}}
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_access_token_expire_minutes: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    {{/if}}
    
    {{#if values.databaseType}}
    {{#if values.databaseType == "postgresql"}}
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/${{ values.name }}_db")
    {{/if}}
    {{#if values.databaseType == "mysql"}}
    database_url: str = os.getenv("DATABASE_URL", "mysql://user:password@localhost:3306/${{ values.name }}_db")
    {{/if}}
    {{#if values.databaseType == "sqlite"}}
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./${{ values.name }}.db")
    {{/if}}
    {{#if values.databaseType == "mongodb"}}
    mongodb_url: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017/${{ values.name }}_db")
    {{/if}}
    {{/if}}
    
    {{#if values.enableCors}}
    cors_origins: list[str] = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    {{/if}}
    
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
{{else}}
class Config:
    """Application configuration."""
    
    APP_NAME = os.getenv("APP_NAME", "${{ values.__APP_NAME__ }}")
    APP_ENV = os.getenv("APP_ENV", "development")
    DEBUG = os.getenv("DEBUG", "true").lower() == "true"
    PORT = int(os.getenv("PORT", "${{ values.port }}"))
    API_VERSION = os.getenv("API_VERSION", "${{ values.apiVersion }}")
    
    {{#if values.enableAuth}}
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-in-production")
    JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    {{/if}}
    
    {{#if values.databaseType}}
    {{#if values.databaseType == "postgresql"}}
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/${{ values.name }}_db")
    {{/if}}
    {{#if values.databaseType == "mysql"}}
    DATABASE_URL = os.getenv("DATABASE_URL", "mysql://user:password@localhost:3306/${{ values.name }}_db")
    {{/if}}
    {{#if values.databaseType == "sqlite"}}
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./${{ values.name }}.db")
    {{/if}}
    {{#if values.databaseType == "mongodb"}}
    MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/${{ values.name }}_db")
    {{/if}}
    {{/if}}
    
    {{#if values.enableCors}}
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
    {{/if}}
    
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")


config = Config()
{{/if}}

