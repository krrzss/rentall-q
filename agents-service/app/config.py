import os
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env from current directory, root directory, or frontend/.env.local
current_dir = Path(__file__).resolve().parent
for env_path in [
    current_dir.parent / ".env",
    current_dir.parent.parent / ".env",
    current_dir.parent.parent / "frontend" / ".env.local",
]:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)


class Settings(BaseSettings):
    PROJECT_NAME: str = "RentAll-Q AI Agents Microservice"
    VERSION: str = "1.0.0"
    PORT: int = int(os.getenv("AGENTS_SERVICE_PORT") or os.getenv("AGENTS_PORT") or 8000)
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL") or os.getenv("NEXT_PUBLIC_SUPABASE_URL", "")
    SUPABASE_KEY: str = (
        os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_KEY")
        or os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "")
    )


settings = Settings()
