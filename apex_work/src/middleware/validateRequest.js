import AppError from "../utils/AppError.js";

export default function validateRequest(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return next(new AppError("Validation failed.", 400, "VALIDATION_ERROR", result.error.issues.map(issue => ({ field:issue.path.join("."), message:issue.message }))));
    req.body = result.data;
    next();
  };
}
