# Projects Service

A FastAPI service for managing projects in the cloud project manager system.

## Features

- Create, read, update, and delete projects
- Manage project members (invite/remove)
- In-memory repository implementation (stubbed for future database integration)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the service:
```bash
uvicorn src.main:app --reload
```

The service will be available at `http://localhost:8000`

### Observability Configuration

The service now emits:

- Rotating JSON logs (default directory: `./logs`)
- OpenTelemetry request/response metrics (`http.server.request.count` and `http.server.request.duration`)

Optional runtime environment variables:

- `LOG_DIR` (default: `./logs`)
- `LOG_LEVEL` (default: `INFO`)
- `SERVICE_NAME` (default: `projects-service`)
- `SERVICE_VERSION` (default: `1.0.0`)
- `OTEL_EXPORTER_OTLP_METRICS_ENDPOINT` (default: `http://127.0.0.1:4318/v1/metrics`)
- `OTEL_EXPORT_INTERVAL_MS` (default: `15000`)

## API Documentation

Once the service is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
projects_service/
├── src/
│   ├── main.py                 # FastAPI application entry point
│   ├── types/
│   │   ├── entities.py         # Project entity models
│   │   └── schemas.py          # Pydantic validation schemas
│   ├── controllers/
│   │   └── project_controller.py
│   ├── routes/
│   │   └── project_routes.py
│   └── repositories/
│       ├── interfaces.py
│       └── in_memory_project_repository.py
├── requirements.txt
└── README.md
```

