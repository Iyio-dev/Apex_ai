import AppError from "../utils/AppError.js";

/** Normalize known errors without exposing internal details. */
export function normalizeError(err) {
  if (err instanceof AppError) return err;
  if (err?.name === "ZodError") return new AppError("Validation failed.", 400, "VALIDATION_ERROR", err.issues?.map(issue => ({ field: issue.path.join("."), message: issue.message })));
  if (err?.name === "ValidationError") return new AppError("Validation failed.", 400, "VALIDATION_ERROR", Object.values(err.errors || {}).map(issue => ({ field: issue.path, message: issue.message })));
  if (err?.name === "CastError") return new AppError("Invalid identifier or field value.", 400, "INVALID_PARAMETER");
  if (err?.code === 11000) return new AppError("A record with this value already exists.", 409, "DUPLICATE_RESOURCE");
  if (err?.type === "entity.too.large") return new AppError("Request body is too large.", 413, "PAYLOAD_TOO_LARGE");
  if (err?.type === "entity.parse.failed" || (err instanceof SyntaxError && "body" in err)) return new AppError("Malformed JSON request body.", 400, "INVALID_JSON");
  if (err?.type === "entity.unsupported") return new AppError("Unsupported request encoding.", 415, "UNSUPPORTED_MEDIA_TYPE");
  if (err?.name === "TokenExpiredError" || err?.name === "JsonWebTokenError") return new AppError("Your session is invalid or expired.", 401, "UNAUTHENTICATED");
  return new AppError("An unexpected server error occurred.", 500, "INTERNAL_ERROR");
}

export default function errorMiddleware(err, req, res, next) {
  if (res.headersSent) return next(err);
  const normalized = normalizeError(err);
  const status = normalized.statusCode;
  // Raw exceptions may contain provider payloads and connection details.
  if (status >= 500) console.error(JSON.stringify({ level:"error", requestId:req.id, method:req.method, status, code:normalized.code }));
  const payload = { success:false, code:normalized.code, message:normalized.message, requestId:req.id };
  if (normalized.retryAfterSeconds) {
    res.setHeader("Retry-After", String(normalized.retryAfterSeconds));
    payload.retryAfterSeconds = normalized.retryAfterSeconds;
  }
  if (normalized.details?.length) payload.details = normalized.details;
  res.status(status).json(payload);
}
