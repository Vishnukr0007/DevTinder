import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (userData) => {
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
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  const user = await prisma.user.create({
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "USER",
      isEmailVerified: false,
      emailVerificationToken: hashedVerificationToken,
      emailVerificationExpires,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      isEmailVerified: true,
      createdAt: true,
    },
  });

  const token = generateToken(user.id, user.role);
  return { user, token, verificationToken };
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
    const error = new Error("Your account has been suspended by an Administrator.");
    error.statusCode = 403;
    throw error;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user.id, user.role);
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

export const forgotPasswordService = async (email) => {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return null;

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetPasswordToken: hashedResetToken, resetPasswordExpires },
  });

  return resetToken;
};

export const resetPasswordService = async (resetToken, newPassword) => {
  const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetPasswordToken: hashedResetToken,
      resetPasswordExpires: { gt: new Date() },
    },
  });

  if (!user) {
    const error = new Error("Invalid or expired password reset token");
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
    },
  });

  return true;
};
