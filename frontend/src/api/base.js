const DEFAULT_BACKEND_PORT = "8000";

export function resolveApiBaseUrl() {
  if (typeof window === "undefined") return "";

  const configured = import.meta.env.VITE_API_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");

  const { protocol, hostname } = window.location;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return `${protocol}//${hostname}:${DEFAULT_BACKEND_PORT}`;
  }

  return "";
}

export function resolveIntegrationApiBase() {
  const baseUrl = resolveApiBaseUrl();
  return baseUrl ? `${baseUrl}/api/v1/integration` : "/api/v1/integration";
}
