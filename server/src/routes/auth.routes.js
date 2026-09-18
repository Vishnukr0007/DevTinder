import express from "express";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
  googleRedirect,
  googleCallback,
  githubRedirect,
  githubCallback,
} from "../controllers/auth.controller.js";
import {
  validateSignupInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from "../validators/user.validator.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public Authentication Routes
router.post("/signup", validateSignupInput, signup);
router.post("/login", validateLoginInput, login);
router.post("/logout", logout);
router.post("/forgot-password", validateForgotPasswordInput, forgotPassword);
router.post("/reset-password", validateResetPasswordInput, resetPassword);
router.post("/verify-email", verifyEmail);

// Google & GitHub OAuth Routes
router.get("/google", googleRedirect);
router.get("/google/callback", googleCallback);
router.get("/github", githubRedirect);
router.get("/github/callback", githubCallback);

// Protected Authentication Routes
router.get("/me", protect, getCurrentUser);
router.post("/send-verification", protect, sendVerificationEmail);

export default router;