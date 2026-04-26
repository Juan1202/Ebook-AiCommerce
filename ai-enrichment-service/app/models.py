from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.database import Base

class EnrichmentRequest(Base):
    __tablename__ = "enrichment_requests"

    id = Column(Integer, primary_key=True, index=True)
    isbn = Column(String)
    title = Column(String)
    author = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class EnrichmentResult(Base):
    __tablename__ = "enrichment_results"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer)
    source = Column(String)
    confidence = Column(String)
    normalized_title = Column(String)
    normalized_author = Column(String)
    cover_url = Column(Text)