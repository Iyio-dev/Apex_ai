const errorMiddleware = (err, req, res, next) => {
  if (res.headersSent) return next(err);

  let statusCode = err.statusCode || 500;
  let message = err.message || "An unexpected error occurred.";

  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "The submitted data is invalid.";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "The supplied identifier is invalid.";
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "A record with this value already exists.";
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Request body contains invalid JSON.";
  }

  const payload = { success: false, message };
  if (process.env.NODE_ENV !== "production" && statusCode >= 500) {
    payload.error = err.stack;
  }

  res.status(statusCode).json(payload);
};

export default errorMiddleware;
