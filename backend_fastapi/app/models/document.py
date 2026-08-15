from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    content_type = Column(String)
    # We will use this ID to find data in LanceDB
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Processing status: "processing", "completed", "failed"
    processing_status = Column(String, nullable=False, default="processing")
    # Error message if processing failed
    processing_error = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="documents")
