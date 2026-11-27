import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";
import AppError from "../utils/AppError.js";

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing from the environment.");

  return jwt.sign({ id: user._id.toString(), version: user.tokenVersion ?? 0 }, secret, { expiresIn: "7d", algorithm: "HS256" });
};

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  bio: user.bio,
  role: user.role,
  createdAt: user.createdAt,
});

const setSession = (res, token) =>
  res.cookie("apex_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
export const logout = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
  res.clearCookie("apex_session", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.json({ success: true, message: "Signed out" });
});
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, bio } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    bio,
  });
  const token = generateToken(user);

  setSession(res, token);
  res.status(201).json({
    success: true,
    message: "Account created successfully.",
    user: publicUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password +tokenVersion");

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = generateToken(user);

  setSession(res, token);
  res.status(200).json({
    success: true,
    message: "Login successful.",
    user: publicUser(user),
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, user: publicUser(req.user) });
});
