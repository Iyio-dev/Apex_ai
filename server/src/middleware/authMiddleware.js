import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError("Authentication token is required.", 401);
  }

  const token = authorization.slice(7).trim();
  if (!token) throw new AppError("Authentication token is required.", 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Your session is invalid or has expired. Please log in again.", 401);
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new AppError("The account for this token no longer exists.", 401);

  req.user = user;
  next();
});

export default authMiddleware;
