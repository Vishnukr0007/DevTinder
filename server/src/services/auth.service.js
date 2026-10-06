import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import generateToken from "../utils/generateToken.js";
import { sendPasswordResetEmail, sendWelcomeVerificationEmail } from "./email.service.js";
import { env } from "../config/env.js";

export const registerUser = async (userData, clientBaseUrl) => {
  const { firstName, lastName, email, password } = userData;

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
    const error = new Error("User with this email already exists");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "USER",
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires: verificationExpires,
    },
  });

  const baseUrl = clientBaseUrl || env.CORS_ORIGIN || "http://localhost:5173";
  const verificationUrl = `${baseUrl}/verify-email?token=${verificationToken}`;
  const userName = `${user.firstName} ${user.lastName || ""}`.trim();

  try {
    await sendWelcomeVerificationEmail({
      toEmail: user.email,
      userName,
      verificationUrl,
    });
  } catch (err) {
    console.warn("⚠️ Failed to dispatch welcome verification email:", err.message);
  }

  const token = generateToken(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
    },
    token,
  };
};

export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (user.isSuspended) {
    const error = new Error("Your account has been suspended. Please contact support.");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user.id, user.email, user.role);
  return {
    user: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      headline: user.headline,
      avatarUrl: user.avatarUrl,
    },
    token,
  };
};

export const forgotPasswordService = async (email, clientBaseUrl) => {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    const error = new Error("No user account found with this email address.");
    error.statusCode = 404;
    throw error;
  }

  // Generate 6-digit OTP code (e.g., 482910)
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(otpCode).digest("hex");
  const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedOtp,
      resetPasswordExpires,
      resetPasswordUsedAt: null,
    },
  });

  const baseUrl = clientBaseUrl || env.CORS_ORIGIN || "http://localhost:5173";
  const resetUrl = `${baseUrl}/forgot-password?email=${encodeURIComponent(user.email)}&otp=${otpCode}`;
  const userName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.email.split("@")[0];

  let emailResult = null;
  try {
    emailResult = await sendPasswordResetEmail({
      toEmail: user.email,
      userName,
      otpCode,
      resetUrl,
    });
  } catch (err) {
    console.warn("⚠️ Failed to dispatch reset email via transport:", err.message);
  }

  return { emailResult, resetUrl, otpCode };
};

export const verifyOtpService = async (email, otpCode) => {
  if (!email || !otpCode) {
    const error = new Error("Email address and OTP code are required.");
    error.statusCode = 400;
    throw error;
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    const error = new Error("No account found for this email address.");
    error.statusCode = 404;
    throw error;
  }

  const cleanOtp = otpCode.toString().trim();
  const hashedOtp = crypto.createHash("sha256").update(cleanOtp).digest("hex");

  if (!user.resetPasswordToken || user.resetPasswordToken !== hashedOtp) {
    const error = new Error("Invalid OTP code. Please check the 6-digit code sent to your email.");
    error.statusCode = 400;
    throw error;
  }

  if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
    const error = new Error("OTP code has expired. Please request a new OTP code.");
    error.statusCode = 400;
    throw error;
  }

  // OTP is valid! Generate a temporary single-use reset token for setting the new password
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins for password entry

  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires,
    },
  });

  return { resetToken };
};

export const resetPasswordService = async (resetToken, newPassword) => {
  if (!resetToken || typeof resetToken !== "string" || resetToken.trim() === "") {
    const error = new Error("Reset token is required");
    error.statusCode = 400;
    throw error;
  }

  const hashedResetToken = crypto.createHash("sha256").update(resetToken.trim()).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: { gt: new Date() },
      resetPasswordUsedAt: null,
    },
  });

  if (!user) {
    const error = new Error("Invalid or expired password reset token. Please request a new OTP.");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      resetPasswordUsedAt: new Date(),
    },
  });

  return true;
};
