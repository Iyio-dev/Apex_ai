import AppError from "../utils/AppError.js";

export default function contentEditorMiddleware(req, res, next) {
  // Never grant privileges solely because an email appears in configuration.
  if (!["content_editor", "admin"].includes(req.user?.role)) {
    return next(new AppError("Content editor access required", 403));
  }
  next();
}
