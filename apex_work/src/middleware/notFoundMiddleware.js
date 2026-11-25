import AppError from "../utils/AppError.js";
export default function notFoundMiddleware(req, res, next) {
  next(new AppError("API endpoint not found.", 404, "ROUTE_NOT_FOUND"));
}
