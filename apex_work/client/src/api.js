const BASE = import.meta.env.VITE_API_URL || "";
export class ApiError extends Error {
  constructor(message, { status, code, details, requestId, retryAfterSeconds } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
export async function api(path, { method = "GET", body } = {}) {
  let response;
  try {
    response = await fetch(`${BASE}/api/v1${path}`, {
      method,
      credentials: "include",
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Unable to connect to APEX. Check your connection.", {
      code: "NETWORK_ERROR",
    });
  }
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("The server returned an invalid response.", {
      status: response.status,
      code: "INVALID_RESPONSE",
      requestId: response.headers.get("X-Request-ID"),
    });
  }
  if (!response.ok)
    throw new ApiError(payload.message || "Request failed.", {
      status: response.status,
      code: payload.code,
      details: payload.details,
      requestId: payload.requestId,
      retryAfterSeconds: payload.retryAfterSeconds ?? Number(response.headers.get("Retry-After")),
    });
  return Object.hasOwn(payload, "data") ? payload.data : payload;
}
export const errorText = (error) =>
  error instanceof Error ? error.message : "Something went wrong";
