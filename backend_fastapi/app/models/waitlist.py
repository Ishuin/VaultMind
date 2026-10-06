from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.db.database import Base


class Waitlist(Base):
    __tablename__ = "waitlist"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    source = Column(String, default="landing_page")  # landing_page, pricing, all_filled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
