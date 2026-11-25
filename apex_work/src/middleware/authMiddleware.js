import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { extractAuthToken } from "../utils/authToken.js";

const authMiddleware = asyncHandler(async (req, res, next) => {
  const token = extractAuthToken(req.headers.authorization, req.cookies?.apex_session);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
  } catch {
    throw new AppError("Your session is invalid or has expired. Please log in again.", 401);
  }

  const user = await User.findById(decoded.id).select("+tokenVersion");
  if (!user) throw new AppError("The account for this token no longer exists.", 401);

  if (!Number.isInteger(decoded.version) || decoded.version !== (user.tokenVersion ?? 0)) {
    throw new AppError("Session revoked. Please log in again.", 401);
  }

  req.user = user;
  next();
});

export default authMiddleware;
