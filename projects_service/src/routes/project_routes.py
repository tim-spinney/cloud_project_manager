from fastapi import APIRouter, Query
from ..controllers.project_controller import ProjectController
from ..types.schemas import (
    CreateProjectSchema,
    UpdateProjectSchema,
    AddMemberSchema
)


def create_project_routes(project_controller: ProjectController) -> APIRouter:
    """Create and configure project routes"""
    router = APIRouter(prefix="/api/projects", tags=["projects"])
    
    @router.post("/", status_code=201)
    async def create_project(data: CreateProjectSchema):
        return await project_controller.create(data)
    
    @router.get("/")
    async def get_all_projects():
        return await project_controller.get_all()
    
    @router.get("/{project_id}")
    async def get_project(project_id: str):
        return await project_controller.get_by_id(project_id)
    
    @router.patch("/{project_id}")
    async def update_project(project_id: str, data: UpdateProjectSchema):
        return await project_controller.update(project_id, data)
    
    @router.delete("/{project_id}")
    async def delete_project(project_id: str):
        return await project_controller.delete(project_id)
    
    @router.post("/{project_id}/members")
    async def add_member(project_id: str, data: AddMemberSchema):
        return await project_controller.add_member(project_id, data)
    
    @router.delete("/{project_id}/members")
    async def remove_member(project_id: str, user_id: str = Query(..., min_length=1, description="User ID to remove")):
        return await project_controller.remove_member(project_id, user_id)
    
    return router

