import { metrics, type Attributes } from "@opentelemetry/api";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { SEMRESATTRS_SERVICE_NAME, SEMRESATTRS_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { MeterProvider, PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";

const exporter = new OTLPMetricExporter({
  url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ?? "http://127.0.0.1:4318/v1/metrics",
});

const metricReader = new PeriodicExportingMetricReader({
  exporter,
  exportIntervalMillis: Number(process.env.OTEL_EXPORT_INTERVAL_MS ?? 15000),
});

const meterProvider = new MeterProvider({
  resource: resourceFromAttributes({
    [SEMRESATTRS_SERVICE_NAME]: process.env.SERVICE_NAME ?? "tasks-service",
    [SEMRESATTRS_SERVICE_VERSION]: process.env.SERVICE_VERSION ?? "1.0.0",
  }),
  readers: [metricReader],
});

metrics.setGlobalMeterProvider(meterProvider);

const meter = metrics.getMeter("tasks-service");

const requestCounter = meter.createCounter("http.server.request.count", {
  description: "Total number of HTTP requests received by the tasks service",
});

const requestDuration = meter.createHistogram("http.server.request.duration", {
  unit: "ms",
  description: "Duration of HTTP requests handled by the tasks service",
});

export function recordHttpRequest(attributes: Attributes, durationMs: number): void {
  requestCounter.add(1, attributes);
  requestDuration.record(durationMs, attributes);
}

export async function shutdownMetrics(): Promise<void> {
  await meterProvider.shutdown();
}
