from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Database Configuration
    database_url: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/transportation_db")
    async_database_url: str = os.getenv("ASYNC_DATABASE_URL", "postgresql+asyncpg://user:password@localhost:5432/transportation_db")
    
    # JWT Configuration
    secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-here-change-in-production")
    algorithm: str = os.getenv("ALGORITHM", "HS256")
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Redis Configuration
    redis_url: str = os.getenv("REDIS_URL", "redis://localhost:6379")
    
    # Application Settings
    debug: bool = os.getenv("DEBUG", "True").lower() == "true"
    api_v1_str: str = os.getenv("API_V1_STR", "/api/v1")
    project_name: str = os.getenv("PROJECT_NAME", "Transportation Management System")
    
    # Small Business Configuration
    small_business_mode: bool = os.getenv("SMALL_BUSINESS_MODE", "True").lower() == "true"
    max_fleet_size: int = int(os.getenv("MAX_FLEET_SIZE", "20"))  # Limit for small business
    auto_dispatch: bool = os.getenv("AUTO_DISPATCH", "True").lower() == "true"
    simple_pricing: bool = os.getenv("SIMPLE_PRICING", "True").lower() == "true"
    
    # CORS Settings
    backend_cors_origins: List[str] = [
        "http://localhost:3000",
        "http://localhost:8080",
        "http://localhost:8000"
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Allow extra fields

settings = Settings()
