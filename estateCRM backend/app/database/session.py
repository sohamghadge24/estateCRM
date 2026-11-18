from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import logger

connect_args = {}
engine_kwargs = {
    "echo": False,
}

if "mysql" in settings.DATABASE_URL:
    connect_args["charset"] = "utf8mb4"
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_recycle": 3600,
        "pool_size": settings.MYSQL_POOL_SIZE,
        "max_overflow": settings.MYSQL_MAX_OVERFLOW,
    })
elif "sqlite" in settings.DATABASE_URL:
    connect_args["check_same_thread"] = False

# Database engine initialized with environment settings
engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    **engine_kwargs
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db.rollback()
        logger.error(f"Database session rollback triggered by exception: {e}")
        raise
    finally:
        db.close()

