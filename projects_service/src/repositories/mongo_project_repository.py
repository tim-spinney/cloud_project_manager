from typing import Optional
from datetime import datetime, timezone
from bson import ObjectId
from pymongo import AsyncMongoClient, ReturnDocument
from .interfaces import IProjectRepository
from ..types.entities import Project


class MongoProjectRepository(IProjectRepository):
    """MongoDB-backed implementation of project repository"""

    def __init__(self, uri: str, database_name: str = "projects_service"):
        self._client = AsyncMongoClient(uri)
        self._db = self._client[database_name]
        self._collection = self._db["projects"]

    def _doc_to_project(self, doc: dict) -> Project:
        return Project(
            id=str(doc["_id"]),
            name=doc["name"],
            description=doc.get("description", ""),
            owner_id=doc["owner_id"],
            member_ids=doc.get("member_ids", []),
            created_at=doc["created_at"],
            last_modified_at=doc["last_modified_at"],
        )

    async def create(self, project: dict) -> Project:
        now = datetime.now(timezone.utc)
        doc = {
            "name": project["name"],
            "description": project.get("description", ""),
            "owner_id": project["owner_id"],
            "member_ids": project.get("member_ids", []),
            "created_at": now,
            "last_modified_at": now,
        }
        result = await self._collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        return self._doc_to_project(doc)

    async def find_by_id(self, project_id: str) -> Optional[Project]:
        try:
            doc = await self._collection.find_one({"_id": ObjectId(project_id)})
        except Exception:
            return None
        if doc is None:
            return None
        return self._doc_to_project(doc)

    async def find_all(self) -> list[Project]:
        cursor = self._collection.find()
        return [self._doc_to_project(doc) async for doc in cursor]

    async def update(self, project_id: str, updates: dict) -> Optional[Project]:
        try:
            oid = ObjectId(project_id)
        except Exception:
            return None

        set_fields = {k: v for k, v in updates.items() if v is not None}
        set_fields["last_modified_at"] = datetime.now(timezone.utc)

        result = await self._collection.find_one_and_update(
            {"_id": oid},
            {"$set": set_fields},
            return_document=ReturnDocument.AFTER,
        )
        if result is None:
            return None
        return self._doc_to_project(result)

    async def delete(self, project_id: str) -> bool:
        try:
            oid = ObjectId(project_id)
        except Exception:
            return False
        result = await self._collection.delete_one({"_id": oid})
        return result.deleted_count > 0

    async def add_member(self, project_id: str, user_id: str) -> Optional[Project]:
        try:
            oid = ObjectId(project_id)
        except Exception:
            return None

        result = await self._collection.find_one_and_update(
            {"_id": oid},
            {
                "$addToSet": {"member_ids": user_id},
                "$set": {"last_modified_at": datetime.now(timezone.utc)},
            },
            return_document=ReturnDocument.AFTER,
        )
        if result is None:
            return None
        return self._doc_to_project(result)

    async def remove_member(self, project_id: str, user_id: str) -> Optional[Project]:
        try:
            oid = ObjectId(project_id)
        except Exception:
            return None

        result = await self._collection.find_one_and_update(
            {"_id": oid},
            {
                "$pull": {"member_ids": user_id},
                "$set": {"last_modified_at": datetime.now(timezone.utc)},
            },
            return_document=ReturnDocument.AFTER,
        )
        if result is None:
            return None
        return self._doc_to_project(result)
