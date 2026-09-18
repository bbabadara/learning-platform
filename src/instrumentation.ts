export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.OTEL_SDK_DISABLED === "true") return;

  const { NodeSDK } = await import("@opentelemetry/sdk-node");
  const { getNodeAutoInstrumentations } = await import(
    "@opentelemetry/auto-instrumentations-node"
  );
  const { OTLPTraceExporter } = await import(
    "@opentelemetry/exporter-trace-otlp-http"
  );
  const { resourceFromAttributes } = await import("@opentelemetry/resources");

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      "service.name": process.env.OTEL_SERVICE_NAME ?? "learning-platform",
      "deployment.environment": "production",
    }),
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? "http://tempo:4318/v1/traces",
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
}