from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uuid
from datetime import timedelta

from . import models, schemas, auth, database

import logging

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler("backend/app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI()

# CORS
origins = [
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:8000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow ALL origins to fix CORS issues
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup Event
@app.on_event("startup")
def startup_event():
    models.Base.metadata.create_all(bind=database.engine)

# Dependency
get_db = database.get_db

# --- Auth Routes ---
@app.post("/auth/token", response_model=schemas.Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    logger.info(f"Login attempt for user: {form_data.username}")
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        logger.warning(f"Failed login attempt for user: {form_data.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    logger.info(f"Successful login for user: {form_data.username}")
    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/auth/verify", response_model=schemas.TokenData)
async def verify_token(current_user: models.User = Depends(auth.get_current_active_user)):
    return {"email": current_user.email, "role": current_user.role}

@app.post("/auth/register", response_model=schemas.Token)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    logger.info(f"Registration attempt for email: {user.email}")
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        logger.warning(f"Registration failed - Email already exists: {user.email}")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        role="user", # Default role
        is_active=True,
        # full_name=user.full_name # Add this if model supports it, schema definitely does
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(f"New user registered successfully: {user.email}")

# --- Job Routes ---
@app.get("/api/jobs", response_model=List[schemas.Job])
def read_jobs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    jobs = db.query(models.Job).filter(models.Job.is_active == True).offset(skip).limit(limit).all()
    return jobs

@app.get("/api/jobs/{job_id}", response_model=schemas.Job)
def read_job(job_id: str, db: Session = Depends(get_db)):
    try:
        job = db.query(models.Job).filter(models.Job.id == uuid.UUID(job_id), models.Job.is_active == True).first()
        if job is None:
            raise HTTPException(status_code=404, detail="Job not found")
        return job
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Job ID format")

@app.post("/api/jobs", response_model=schemas.Job)
def create_job(job: schemas.JobCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    auth.check_admin_role(current_user)
    db_job = models.Job(**job.dict())
    db.add(db_job)
    db.commit()
    db.refresh(db_job)
    return db_job

@app.delete("/api/jobs/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_job(job_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    auth.check_admin_role(current_user)
    job = db.query(models.Job).filter(models.Job.id == uuid.UUID(job_id)).first()
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Soft delete or hard delete? Let's do hard delete for now as per request "delete the job"
    db.delete(job)
    db.commit()
    return

@app.put("/api/jobs/{job_id}", response_model=schemas.Job)
def update_job(job_id: str, job_update: schemas.JobCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    auth.check_admin_role(current_user)
    db_job = db.query(models.Job).filter(models.Job.id == uuid.UUID(job_id)).first()
    if db_job is None:
        raise HTTPException(status_code=404, detail="Job not found")
    
    for key, value in job_update.dict().items():
        setattr(db_job, key, value)
    
    db.commit()
    db.refresh(db_job)
    return db_job

# --- Applicant Routes ---
@app.post("/api/apply", response_model=schemas.Applicant)
async def apply_for_job(
    full_name: str,
    email: str,
    phone: str,
    linkedin_url: Optional[str] = None,
    job_id: Optional[str] = None,
    resume: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # MIME Validation
    if resume.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Local S3 Stub (saving to 'uploads' folder for now)
    upload_dir = "uploads"
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    file_key = f"{uuid.uuid4()}.pdf"
    file_path = os.path.join(upload_dir, file_key)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(resume.file, buffer)

    db_applicant = models.Applicant(
        full_name=full_name,
        email=email,
        phone=phone,
        linkedin_url=linkedin_url,
        job_id=uuid.UUID(job_id) if job_id else None,
        resume_s3_key=file_key
    )
    db.add(db_applicant)
    db.commit()
    db.refresh(db_applicant)
    return db_applicant

@app.get("/api/applicants", response_model=List[schemas.Applicant])
def read_applicants(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    auth.check_admin_role(current_user)
    applicants = db.query(models.Applicant).offset(skip).limit(limit).all()
    return applicants

# --- Blog Routes ---
@app.get("/api/blogs", response_model=List[schemas.Blog])
def read_blogs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    blogs = db.query(models.Blog).filter(models.Blog.is_active == True).order_by(models.Blog.created_at.desc()).offset(skip).limit(limit).all()
    return blogs

@app.post("/api/blogs", response_model=schemas.Blog)
def create_blog(blog: schemas.BlogCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    auth.check_admin_role(current_user)
    db_blog = models.Blog(**blog.dict())
    db.add(db_blog)
    db.commit()
    db.refresh(db_blog)
    return db_blog

@app.get("/api/blogs/{blog_id}", response_model=schemas.Blog)
def read_blog(blog_id: str, db: Session = Depends(get_db)):
    try:
        blog = db.query(models.Blog).filter(models.Blog.id == uuid.UUID(blog_id), models.Blog.is_active == True).first()
        if blog is None:
            raise HTTPException(status_code=404, detail="Blog not found")
        return blog
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Blog ID format")

@app.delete("/api/blogs/{blog_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_blog(blog_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    auth.check_admin_role(current_user)
    blog = db.query(models.Blog).filter(models.Blog.id == uuid.UUID(blog_id)).first()
    if blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    db.delete(blog)
    db.commit()
    return

@app.put("/api/blogs/{blog_id}", response_model=schemas.Blog)
def update_blog(blog_id: str, blog_update: schemas.BlogCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_user)):
    auth.check_admin_role(current_user)
    db_blog = db.query(models.Blog).filter(models.Blog.id == uuid.UUID(blog_id)).first()
    if db_blog is None:
        raise HTTPException(status_code=404, detail="Blog not found")
    
    for key, value in blog_update.dict().items():
        setattr(db_blog, key, value)
    
    db.commit()
    db.refresh(db_blog)
    return db_blog
