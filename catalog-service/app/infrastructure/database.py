import datetime

from sqlalchemy import (Boolean, Column, DateTime, Integer, String,
                        Text, create_engine)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class CategoryModel(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    description = Column(Text, nullable=True)


class BookModel(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    subtitle = Column(String(500), nullable=True)
    author = Column(String(300), nullable=False, index=True)
    publisher = Column(String(300), nullable=True)
    publication_year = Column(Integer, nullable=True)
    volume = Column(String(50), nullable=True)
    isbn = Column(String(20), nullable=True, index=True)
    issn = Column(String(20), nullable=True)
    category_id = Column(Integer, nullable=True, index=True)
    description = Column(Text, nullable=True)
    cover_url = Column(String(500), nullable=True)
    price = Column(Integer, nullable=True)
    enriched_flag = Column(Boolean, default=False)
    published_flag = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow,
                        onupdate=datetime.datetime.utcnow)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
