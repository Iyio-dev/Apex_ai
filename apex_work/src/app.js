import express from "express";
import mongoose from "mongoose";
import AppError from "./utils/AppError.js";
import requestId from "./middleware/requestId.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { generalLimiter, loginLimiter, registrationLimiter } from "./middleware/rateLimiters.js";
import cors from "cors";
import { configuredOrigins, isTrustedCookieMutation, isTrustedSessionCreation } from "./utils/originSecurity.js";
import authRoutes from "./routes/authRoutes.js";
import academicRoutes from "./routes/academicRoutes.js";
import notFoundMiddleware from "./middleware/notFoundMiddleware.js";
import errorMiddleware from "./middleware/errorMiddleware.js";

const app = express();
app.disable('x-powered-by');
app.use(requestId);
app.use(helmet());
app.use(cookieParser());
// Only explicitly configured frontend origins may send credentialed requests.
const allowedOrigins = configuredOrigins(process.env.CLIENT_URL, process.env.NODE_ENV);
app.use((req, res, next) => {
  if (!isTrustedCookieMutation({
    method: req.method,
    hasSessionCookie: Boolean(req.cookies?.apex_session),
    origin: req.get('origin'),
    allowedOrigins,
  })) return next(new AppError('Untrusted request origin', 403, 'UNTRUSTED_ORIGIN'));
  if (!isTrustedSessionCreation({
    method: req.method, path: req.path, origin: req.get('origin'), allowedOrigins,
  })) return next(new AppError('Untrusted session creation origin', 403, 'UNTRUSTED_ORIGIN'));
  next();
});

app.use(express.json({ limit: "1mb" }));

app.get("/health", (req, res) => {
  res.status(200).json({ success: true, message: "APEX API process is running." });
});
// Readiness is separate from liveness; do not send traffic to a disconnected replica.
app.get("/ready", (req, res) => {
  const ready = mongoose.connection.readyState === 1;
  res.status(ready ? 200 : 503).json({ success: ready, database: ready ? "connected" : "unavailable" });
});

app.use("/api/v1", generalLimiter);
app.use("/api/v1/auth/login", loginLimiter);
app.use("/api/v1/auth/register", registrationLimiter);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/academic", academicRoutes);

// Keep these after all application routes.
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
