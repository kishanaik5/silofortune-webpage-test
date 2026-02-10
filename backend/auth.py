import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from . import schemas, models, database

# Load Keys
PRIVATE_KEY_PATH = "private_key.pem"
PUBLIC_KEY_PATH = "public_key.pem"

def load_keys():
    try:
        with open(PRIVATE_KEY_PATH, "r") as f:
            private_key = f.read()
        with open(PUBLIC_KEY_PATH, "r") as f:
            public_key = f.read()
        return private_key, public_key
    except FileNotFoundError:
        print("Keys not found. Generating new keys...")
        # Fallback or error - for now we assume keys will be generated
        return None, None

SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey") # Fallback if keys fail
ALGORITHM = "RS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    
    private_key, _ = load_keys()
    if private_key:
        encoded_jwt = jwt.encode(to_encode, private_key, algorithm=ALGORITHM)
    else:
        # Fallback to HS256 if no keys (dev only)
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    _, public_key = load_keys()
    
    try:
        if public_key:
            payload = jwt.decode(token, public_key, algorithms=[ALGORITHM])
        else:
             payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
             
        email: str = payload.get("sub")
        role: str = payload.get("role")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email, role=role)
    except JWTError:
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(current_user: models.User = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

class RoleChecker:
    def __init__(self, allowed_roles: list):
        self.allowed_roles = allowed_roles

    def __call__(self, user: models.User = Depends(get_current_active_user)):
        if user.role not in self.allowed_roles:
            raise HTTPException(status_code=403, detail="Operation not permitted")
        return user

def check_admin_role(user: models.User):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin privileges required")

def authenticate_user(db: Session, email: str, password: str):
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user
