import json
import logging
import os
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path
from time import perf_counter
from typing import Any

from opentelemetry import metrics
from opentelemetry.exporter.otlp.proto.http.metric_exporter import OTLPMetricExporter
from opentelemetry.sdk.metrics import MeterProvider
from opentelemetry.sdk.metrics.export import PeriodicExportingMetricReader
from opentelemetry.sdk.resources import Resource

SERVICE_NAME = os.getenv("SERVICE_NAME", "projects-service")
SERVICE_VERSION = os.getenv("SERVICE_VERSION", "1.0.0")
LOG_DIR = os.getenv("LOG_DIR", str(Path.cwd() / "logs"))


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "level": record.levelname.lower(),
            "message": record.getMessage(),
            "logger": record.name,
            "service": SERVICE_NAME,
            "timestamp": self.formatTime(record, self.datefmt),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        if hasattr(record, "context"):
            payload["context"] = getattr(record, "context")
        return json.dumps(payload)


def configure_logging() -> logging.Logger:
    Path(LOG_DIR).mkdir(parents=True, exist_ok=True)
    logger = logging.getLogger(SERVICE_NAME)
    logger.setLevel(os.getenv("LOG_LEVEL", "INFO"))
    logger.handlers.clear()
    logger.propagate = False

    formatter = JsonFormatter()

    info_handler = TimedRotatingFileHandler(
        filename=f"{LOG_DIR}/{SERVICE_NAME}.log",
        when="midnight",
        backupCount=14,
        encoding="utf-8",
    )
    info_handler.setFormatter(formatter)

    error_handler = TimedRotatingFileHandler(
        filename=f"{LOG_DIR}/{SERVICE_NAME}-error.log",
        when="midnight",
        backupCount=30,
        encoding="utf-8",
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)

    stream_handler = logging.StreamHandler()
    stream_handler.setFormatter(formatter)

    logger.addHandler(info_handler)
    logger.addHandler(error_handler)
    logger.addHandler(stream_handler)
    return logger


resource = Resource.create(
    {
        "service.name": SERVICE_NAME,
        "service.version": SERVICE_VERSION,
    }
)

metric_exporter = OTLPMetricExporter(
    endpoint=os.getenv("OTEL_EXPORTER_OTLP_METRICS_ENDPOINT", "http://127.0.0.1:4318/v1/metrics")
)
metric_reader = PeriodicExportingMetricReader(
    exporter=metric_exporter,
    export_interval_millis=int(os.getenv("OTEL_EXPORT_INTERVAL_MS", "15000")),
)
meter_provider = MeterProvider(resource=resource, metric_readers=[metric_reader])
metrics.set_meter_provider(meter_provider)
meter = metrics.get_meter("projects-service")

http_request_counter = meter.create_counter(
    "http.server.request.count",
    description="Total number of HTTP requests received by the projects service",
)
http_request_duration = meter.create_histogram(
    "http.server.request.duration",
    unit="ms",
    description="Duration of HTTP requests handled by the projects service",
)


def observe_http_request(method: str, route: str, status_code: int, duration_ms: float) -> None:
    attributes = {
        "http.method": method,
        "http.route": route,
        "http.status_code": status_code,
    }
    http_request_counter.add(1, attributes=attributes)
    http_request_duration.record(duration_ms, attributes=attributes)


def now_ms() -> float:
    return perf_counter() * 1000
