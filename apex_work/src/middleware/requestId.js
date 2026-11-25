import { randomUUID } from "node:crypto";
// Server-generated identifiers cannot be spoofed by callers.
export default function requestId(req, res, next) {
  req.id = randomUUID();
  res.setHeader("X-Request-ID", req.id);
  next();
}
