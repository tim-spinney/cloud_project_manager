from fastapi import FastAPI
from .repositories.interfaces import IProjectRepository
from .repositories.in_memory_project_repository import InMemoryProjectRepository
from .controllers.project_controller import ProjectController
from .routes.project_routes import create_project_routes
import os

app = FastAPI(
    title="Projects Service",
    description="A FastAPI service for managing projects",
    version="1.0.0"
)

# Initialize repositories — use MongoDB when a URI is provided, otherwise fall
# back to the in-memory implementation for local development without a database.
project_repository: IProjectRepository
mongodb_uri = os.getenv("MONGODB_URI")
if mongodb_uri:
    from .repositories.mongo_project_repository import MongoProjectRepository
    project_repository = MongoProjectRepository(mongodb_uri)
else:
    project_repository = InMemoryProjectRepository()

# Initialize controllers
project_controller = ProjectController(project_repository)

# Register routes
app.include_router(create_project_routes(project_controller))


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

