import pymysql
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.sql import func
import os

# --- Database Configuration ---
# Set USE_MYSQL=1 in environment once MySQL credentials are confirmed working
USE_MYSQL = os.getenv("USE_MYSQL", "0") == "1"

DB_USER = os.getenv("DB_USER", "root")
DB_PASS = os.getenv("DB_PASS", "Mohiith@1801")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306"))
DB_NAME = os.getenv("DB_NAME", "retinal_ai")

if USE_MYSQL:
    DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASS}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
else:
    DATABASE_URL = "sqlite+aiosqlite:///patient_data.db"

Base = declarative_base()


class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), index=True)
    last_name = Column(String(100), index=True)
    dob = Column(String(20))
    gender = Column(String(20))
    history = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"))
    image_path = Column(String(500))
    eye = Column(String(10))
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    notes = Column(Text, nullable=True)


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    primary_prediction = Column(String(255))
    confidence = Column(Float)
    severity_grade = Column(Integer)
    report_path = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


def ensure_mysql_database():
    """Create the MySQL database if it doesn't exist (sync step)."""
    try:
        connection = pymysql.connect(
            host=DB_HOST, port=DB_PORT, user=DB_USER,
            password=DB_PASS, charset="utf8mb4", connect_timeout=5,
        )
        with connection.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{DB_NAME}` "
                f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        connection.commit()
        connection.close()
        print(f"[DB] MySQL database '{DB_NAME}' is ready.")
    except Exception as e:
        print(f"[DB ERROR] MySQL connection failed: {e}")
        raise


engine = create_async_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    if USE_MYSQL:
        ensure_mysql_database()
        print("[DB] Using MySQL backend.")
    else:
        print("[DB] Using SQLite backend (set USE_MYSQL=1 to switch).")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[DB] All tables created/verified.")


async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
