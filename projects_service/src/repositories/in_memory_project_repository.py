from typing import Optional
from datetime import datetime, timezone
from .interfaces import IProjectRepository
from ..types.entities import Project


class InMemoryProjectRepository(IProjectRepository):
    """In-memory implementation of project repository"""
    
    def __init__(self):
        self._projects: dict[str, Project] = {}
        self._id_counter = 1
    
    async def create(self, project: dict) -> Project:
        """Create a new project"""
        project_id = f"project-{self._id_counter}"
        self._id_counter += 1
        
        now = datetime.now(timezone.utc)
        new_project = Project(
            id=project_id,
            name=project["name"],
            description=project.get("description", ""),
            owner_id=project["owner_id"],
            member_ids=project.get("member_ids", []),
            created_at=now,
            last_modified_at=now
        )
        
        self._projects[project_id] = new_project
        return new_project
    
    async def find_by_id(self, project_id: str) -> Optional[Project]:
        """Find a project by ID"""
        return self._projects.get(project_id)
    
    async def find_all(self) -> list[Project]:
        """Find all projects"""
        return list(self._projects.values())
    
    async def update(self, project_id: str, updates: dict) -> Optional[Project]:
        """Update a project"""
        project = self._projects.get(project_id)
        if not project:
            return None
        
        # Create updated project data
        update_data = project.model_dump()
        update_data.update({k: v for k, v in updates.items() if v is not None})
        update_data["last_modified_at"] = datetime.now(timezone.utc)
        
        updated_project = Project(**update_data)
        self._projects[project_id] = updated_project
        return updated_project
    
    async def delete(self, project_id: str) -> bool:
        """Delete a project"""
        if project_id in self._projects:
            del self._projects[project_id]
            return True
        return False
    
    async def add_member(self, project_id: str, user_id: str) -> Optional[Project]:
        """Add a member to a project"""
        project = self._projects.get(project_id)
        if not project:
            return None
        
        if user_id not in project.member_ids:
            updated_member_ids = project.member_ids + [user_id]
            return await self.update(project_id, {
                "member_ids": updated_member_ids
            })
        return project
    
    async def remove_member(self, project_id: str, user_id: str) -> Optional[Project]:
        """Remove a member from a project"""
        project = self._projects.get(project_id)
        if not project:
            return None
        
        if user_id in project.member_ids:
            updated_member_ids = [mid for mid in project.member_ids if mid != user_id]
            return await self.update(project_id, {
                "member_ids": updated_member_ids
            })
        return project

