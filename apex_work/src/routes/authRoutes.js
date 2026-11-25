import { Router } from "express";
import { getMe, login, register, logout } from "../controllers/authController.js";
import { registerSchema, loginSchema } from "../validators/authValidators.js";
import validateRequest from "../middleware/validateRequest.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), register);
router.post("/login", validateRequest(loginSchema), login);
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

export default router;
