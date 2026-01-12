from abc import ABC, abstractmethod
from typing import Optional
from datetime import datetime
from ..types.entities import Project


class IProjectRepository(ABC):
    """Interface for project repository operations"""
    
    @abstractmethod
    async def create(
        self, 
        project: dict
    ) -> Project:
        """Create a new project"""
        pass
    
    @abstractmethod
    async def find_by_id(self, project_id: str) -> Optional[Project]:
        """Find a project by ID"""
        pass
    
    @abstractmethod
    async def find_all(self) -> list[Project]:
        """Find all projects"""
        pass
    
    @abstractmethod
    async def update(
        self, 
        project_id: str, 
        updates: dict
    ) -> Optional[Project]:
        """Update a project"""
        pass
    
    @abstractmethod
    async def delete(self, project_id: str) -> bool:
        """Delete a project"""
        pass
    
    @abstractmethod
    async def add_member(self, project_id: str, user_id: str) -> Optional[Project]:
        """Add a member to a project"""
        pass
    
    @abstractmethod
    async def remove_member(self, project_id: str, user_id: str) -> Optional[Project]:
        """Remove a member from a project"""
        pass

