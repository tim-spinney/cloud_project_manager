from fastapi import HTTPException, status
from ..repositories.interfaces import IProjectRepository
from ..types.schemas import (
    CreateProjectSchema,
    UpdateProjectSchema,
    AddMemberSchema
)


class ProjectController:
    """Controller for project operations"""
    
    def __init__(self, project_repository: IProjectRepository):
        self.project_repository = project_repository
    
    async def create(self, data: CreateProjectSchema):
        """Create a new project"""
        try:
            project = await self.project_repository.create({
                "name": data.name,
                "description": data.description,
                "owner_id": data.owner_id,
                "member_ids": data.member_ids or []
            })
            return project
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to create project: {str(e)}"
            )
    
    async def get_by_id(self, project_id: str):
        """Get a project by ID"""
        project = await self.project_repository.find_by_id(project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return project
    
    async def get_all(self):
        """Get all projects"""
        projects = await self.project_repository.find_all()
        return projects
    
    async def update(self, project_id: str, data: UpdateProjectSchema):
        """Update a project"""
        updates = {}
        if data.name is not None:
            updates["name"] = data.name
        if data.description is not None:
            updates["description"] = data.description
        
        if not updates:
            # If no updates provided, return the existing project
            project = await self.project_repository.find_by_id(project_id)
            if not project:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Project not found"
                )
            return project
        
        updated_project = await self.project_repository.update(project_id, updates)
        if not updated_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return updated_project
    
    async def delete(self, project_id: str):
        """Delete a project"""
        deleted = await self.project_repository.delete(project_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return {"message": "Project deleted successfully"}
    
    async def add_member(self, project_id: str, data: AddMemberSchema):
        """Add a member to a project"""
        updated_project = await self.project_repository.add_member(
            project_id, 
            data.user_id
        )
        if not updated_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return updated_project
    
    async def remove_member(self, project_id: str, user_id: str):
        """Remove a member from a project"""
        updated_project = await self.project_repository.remove_member(
            project_id,
            user_id
        )
        if not updated_project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        return updated_project

