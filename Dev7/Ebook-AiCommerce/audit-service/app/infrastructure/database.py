import datetime

from sqlalchemy import Boolean, Column, DateTime, Float, Integer, String, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class AuditModel(Base):
    __tablename__ = "audit_decisions"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    module = Column(String(120), nullable=False, index=True)
    decision = Column(String(256), nullable=False)
    estado = Column(String(60), nullable=False, index=True)
    anomaly = Column(Boolean, default=False, nullable=False)
    source = Column(String(120), nullable=False)
    original_value = Column(Float, nullable=False)
    computed_value = Column(Float, nullable=False)
    rule = Column(String(256), nullable=True)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
