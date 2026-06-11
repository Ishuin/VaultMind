# Database Initialization Script
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to sys.path to allow importing from 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.db.database import Base
from app.models.user import User
from app.core.security import get_password_hash

def init_db():
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    # Check if we have an admin user
    user = db.query(User).filter(User.email == "admin@thoughtweb.com").first()
    if not user:
        admin_user = User(
            email="admin@thoughtweb.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            is_superuser=True
        )
        db.add(admin_user)
        db.commit()
        print("Created admin user: admin@thoughtweb.com / admin123")
    else:
        print("Admin user already exists.")
    
    db.close()

if __name__ == "__main__":
    init_db()
