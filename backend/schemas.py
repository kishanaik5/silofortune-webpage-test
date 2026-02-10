from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from uuid import UUID

# User Schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    full_name: Optional[str] = None
    password: str

class User(UserBase):
    id: UUID
    is_active: bool
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

# Job Schemas
class JobBase(BaseModel):
    title: str
    location: str
    type: str # Full-time, Contract, etc.
    salary_range: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = True

class JobCreate(JobBase):
    pass

class Job(JobBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

# Applicant Schemas
class ApplicantBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: str
    linkedin_url: Optional[str] = None
    job_id: Optional[UUID] = None

class ApplicantCreate(ApplicantBase):
    pass

class Applicant(ApplicantBase):
    id: UUID
    resume_s3_key: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

# Blog Schemas
class BlogBase(BaseModel):
    title: str
    excerpt: str
    content: str
    author: Optional[str] = "Silo Fortune Team"
    category: Optional[str] = "General"
    image_emoji: Optional[str] = "📝"

class BlogCreate(BlogBase):
    pass

class Blog(BlogBase):
    id: UUID
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True
