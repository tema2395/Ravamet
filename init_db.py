import sys
import os

# Add the parent directory to the path to make imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.session import engine, SessionLocal
from app.db.models import Base, UserStatus, VacancyStatus, ResponseStatus, User
from app.core.auth import get_password_hash
from app.services.factory import ServiceFactory


def init_db():
    """Initialize the database with tables and initial data"""
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create a session
    db = SessionLocal()
    
    try:
        # Get user service
        user_service = ServiceFactory.create_user_service(db)
        
        # Check if admin user exists
        admin = user_service.get_user_by_email("admin@example.com")
        
        # Create admin user if not exists
        if not admin:
            from app.schemas.requests import UserCreate
            
            admin_user = UserCreate(
                email="admin@example.com",
                phone="+1234567890",
                name="Admin",
                surname="User",
                password="adminpassword"  # Change in production!
            )
            
            user_service.create_user(admin_user)
            print("Admin user created.")
        else:
            print("Admin user already exists.")
        
        # Test database connection
        result = db.execute(text("SELECT 1"))
        print(f"Database connection test: {result.scalar() == 1}")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialization completed.")
