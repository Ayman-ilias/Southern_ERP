from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError
from .config import settings
import time
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database engine with connection pooling for 300+ concurrent users
# Optimized for 200-250 concurrent users with millions of records
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,          # Test connections before using
    pool_size=100,               # Base connection pool (increased from 20)
    max_overflow=100,            # Additional connections under load (increased from 30)
    pool_recycle=1800,           # Recycle connections every 30 minutes (reduced from 3600)
    pool_timeout=60,             # Wait max 60s for connection (increased from 30)
    echo_pool=False,             # Disable pool logging in production
    pool_use_lifo=True,          # Use LIFO for better connection reuse
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()


def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database - create all tables"""
    max_retries = 5
    retry_interval = 5

    for attempt in range(max_retries):
        try:
            logger.info(f"Attempting to connect to database (attempt {attempt + 1}/{max_retries})...")
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables created successfully!")
            return True
        except OperationalError as e:
            if attempt < max_retries - 1:
                logger.warning(f"Database connection failed: {e}. Retrying in {retry_interval} seconds...")
                time.sleep(retry_interval)
            else:
                logger.error(f"Failed to connect to database after {max_retries} attempts")
                raise
    return False
