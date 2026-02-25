from fastapi import FastAPI
from fastapi import Request
from .repositories.in_memory_project_repository import InMemoryProjectRepository
from .controllers.project_controller import ProjectController
from .routes.project_routes import create_project_routes
import os
from .observability import configure_logging, observe_http_request, now_ms

app = FastAPI(
    title="Projects Service",
    description="A FastAPI service for managing projects",
    version="1.0.0"
)
logger = configure_logging()

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


@app.middleware("http")
async def observability_middleware(request: Request, call_next):
    start_ms = now_ms()
    response = await call_next(request)
    duration_ms = now_ms() - start_ms
    route = request.url.path
    status_code = response.status_code

    observe_http_request(request.method, route, status_code, duration_ms)
    logger.info(
        "request_completed",
        extra={
            "context": {
                "method": request.method,
                "route": route,
                "status_code": status_code,
                "duration_ms": round(duration_ms, 2),
                "user_agent": request.headers.get("user-agent", ""),
            }
        },
    )
    return response


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info("service_started", extra={"context": {"port": port}})
    uvicorn.run(app, host="0.0.0.0", port=port)

