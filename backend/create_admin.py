from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import models, auth

def create_admin():
    db = SessionLocal()
    
    email = "admin@silofortune.com"
    password = "admin123"
    
    # Check if admin already exists
    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        print(f"Admin user {email} already exists.")
        return

    hashed_password = auth.get_password_hash(password)
    new_admin = models.User(
        email=email,
        hashed_password=hashed_password,
        role="admin",
        is_active=True
    )
    
    db.add(new_admin)
    db.commit()
    print(f"Admin user created successfully!\nEmail: {email}\nPassword: {password}")
    db.close()

if __name__ == "__main__":
    create_admin()
