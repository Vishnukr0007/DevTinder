import express from "express";
import {
  signup,
  login,
  logout,
  getCurrentUser,
  forgotPassword,
  verifyOtp,
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
  validateVerifyOtpInput,
  validateResetPasswordInput,
} from "../validators/user.validator.js";
import { protect } from "../middleware/auth.middleware.js";
import { passwordResetLimiter } from "../middleware/rateLimiter.middleware.js";

const router = express.Router();

// Public Authentication Routes
router.post("/signup", validateSignupInput, signup);
router.post("/login", validateLoginInput, login);
router.post("/logout", logout);
router.post("/forgot-password", passwordResetLimiter, validateForgotPasswordInput, forgotPassword);
router.post("/verify-otp", passwordResetLimiter, validateVerifyOtpInput, verifyOtp);
router.post("/reset-password", passwordResetLimiter, validateResetPasswordInput, resetPassword);
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