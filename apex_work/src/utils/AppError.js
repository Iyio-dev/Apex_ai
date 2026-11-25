/** Expected, client-safe application failure. */
export default class AppError extends Error {
  constructor(message, statusCode = 500, code, details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code || ({400:"BAD_REQUEST",401:"UNAUTHENTICATED",403:"FORBIDDEN",404:"NOT_FOUND",409:"CONFLICT",429:"RATE_LIMITED"}[statusCode] || "SERVICE_UNAVAILABLE");
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}
