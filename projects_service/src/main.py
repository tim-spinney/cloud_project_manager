from fastapi import FastAPI
from .repositories.in_memory_project_repository import InMemoryProjectRepository
from .controllers.project_controller import ProjectController
from .routes.project_routes import create_project_routes
import os

app = FastAPI(
    title="Projects Service",
    description="A FastAPI service for managing projects",
    version="1.0.0"
)

# Initialize repositories
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

