from typing import Optional
from pydantic import BaseModel, Field, field_validator


class CreateProjectSchema(BaseModel):
    """Schema for creating a new project"""
    name: str = Field(..., min_length=1, description="Project name is required")
    description: str = Field(default="", description="Project description")
    owner_id: str = Field(..., min_length=1, description="Owner ID is required")
    member_ids: Optional[list[str]] = Field(default_factory=list, description="Initial member IDs")


class UpdateProjectSchema(BaseModel):
    """Schema for updating a project"""
    name: Optional[str] = Field(None, min_length=1, description="Project name")
    description: Optional[str] = Field(None, description="Project description")


class AddMemberSchema(BaseModel):
    """Schema for adding a member to a project"""
    user_id: str = Field(..., min_length=1, description="User ID is required")




class ProjectIdParam(BaseModel):
    """Schema for project ID path parameter"""
    id: str = Field(..., min_length=1, description="Project ID is required")

