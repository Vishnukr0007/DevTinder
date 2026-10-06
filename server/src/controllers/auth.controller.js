import bcrypt from "bcrypt";
import crypto from "crypto";
import prisma from "../config/prisma.js";
import generateToken from "../utils/generateToken.js";
import {
  forgotPasswordService,
  verifyOtpService,
  resetPasswordService,
} from "../services/auth.service.js";
import {
  getGoogleAuthUrl,
  getGoogleUser,
  getGithubAuthUrl,
  getGithubUser,
  findOrCreateOAuthUser,
} from "../services/oauth.service.js";
import {
  sendWelcomeVerificationEmail,
} from "../services/email.service.js";

/**
 * @desc    1. Register a new Developer (USER role)
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required (firstName, lastName, email, password)",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token (24-hour expiry)
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

    const clientOrigin = req.headers.origin || req.headers.referer || "http://localhost:5173";
    const verificationUrl = `${clientOrigin}/verify-email?token=${verificationToken}`;
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

    const token = generateToken(user.id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "Developer registered successfully. Verification email dispatched to your inbox.",
      token,
      user,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during registration",
    });
  }
};

/**
 * @desc    2. Authenticate User & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended by an Administrator.",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
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
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
    });
  }
};

/**
 * @desc    3. Logout User & clear auth cookie
 * @route   POST /api/auth/logout
 * @access  Private / Public
 */
export const logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during logout",
    });
  }
};

/**
 * @desc    4. Get Current Logged-In User Details
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        headline: true,
        bio: true,
        avatarUrl: true,
        location: true,
        role: true,
        experienceLevel: true,
        isOpenToPairing: true,
        isEmailVerified: true,
        isSuspended: true,
        githubUrl: true,
        linkedinUrl: true,
        userSkills: { select: { id: true, name: true, level: true } },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User profile not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get Current User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching current user profile",
    });
  }
};

/**
 * @desc    5. Initiate Forgot Password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Registered email address is required",
      });
    }

    const clientOrigin = req.headers.origin || req.headers.referer || "http://localhost:5173";
    await forgotPasswordService(email, clientOrigin);

    return res.status(200).json({
      success: true,
      message: "A 6-digit OTP code has been sent to your email address.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error initiating forgot password",
    });
  }
};

/**
 * @desc    5b. Verify 6-digit OTP Code
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email address and OTP code are required",
      });
    }

    const { resetToken } = await verifyOtpService(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully! Please set your new password.",
      resetToken,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error verifying OTP",
    });
  }
};

/**
 * @desc    6. Reset Password with Token
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required",
      });
    }

    await resetPasswordService(resetToken, newPassword);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || "Internal server error resetting password",
    });
  }
};

/**
 * @desc    7. Send / Resend Email Verification Token
 * @route   POST /api/auth/send-verification
 * @access  Private / Public
 */
export const sendVerificationEmail = async (req, res) => {
  try {
    const email = req.user?.email || req.body.email;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ success: false, message: "Email is already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const hashedVerificationToken = crypto.createHash("sha256").update(verificationToken).digest("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: hashedVerificationToken,
        emailVerificationExpires,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Email verification token generated successfully",
      verificationToken,
      expiresInHours: 24,
    });
  } catch (error) {
    console.error("Send Verification Email Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error sending verification email",
    });
  }
};

/**
 * @desc    7b. Verify Email Token
 * @route   POST /api/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: "Verification token is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token",
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Email address verified successfully!",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error verifying email",
    });
  }
};

/**
 * @desc    8. Initiate Google OAuth 2.0 Flow
 * @route   GET /api/auth/google
 * @access  Public
 */
export const googleRedirect = (req, res) => {
  try {
    const url = getGoogleAuthUrl();
    return res.redirect(url);
  } catch (error) {
    console.error("Google OAuth Redirect Error:", error);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/login?error=google_oauth_failed`);
  }
};

/**
 * @desc    8b. Handle Google OAuth 2.0 Callback
 * @route   GET /api/auth/google/callback
 * @access  Public
 */
export const googleCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${clientUrl}/login?error=no_code_provided`);
    }

    const profile = await getGoogleUser(code);
    const user = await findOrCreateOAuthUser(profile);

    if (user.isSuspended) {
      return res.redirect(`${clientUrl}/login?error=account_suspended`);
    }

    const token = generateToken(user.id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${clientUrl}/app/dashboard`);
  } catch (error) {
    console.error("Google OAuth Callback Error:", error.message);
    return res.redirect(`${clientUrl}/login?error=google_auth_failed`);
  }
};

/**
 * @desc    9. Initiate GitHub OAuth 2.0 Flow
 * @route   GET /api/auth/github
 * @access  Public
 */
export const githubRedirect = (req, res) => {
  try {
    const url = getGithubAuthUrl();
    return res.redirect(url);
  } catch (error) {
    console.error("GitHub OAuth Redirect Error:", error);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(`${clientUrl}/login?error=github_oauth_failed`);
  }
};

/**
 * @desc    9b. Handle GitHub OAuth 2.0 Callback
 * @route   GET /api/auth/github/callback
 * @access  Public
 */
export const githubCallback = async (req, res) => {
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${clientUrl}/login?error=no_code_provided`);
    }

    const profile = await getGithubUser(code);
    const user = await findOrCreateOAuthUser(profile);

    if (user.isSuspended) {
      return res.redirect(`${clientUrl}/login?error=account_suspended`);
    }

    const token = generateToken(user.id, user.role);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${clientUrl}/app/dashboard`);
  } catch (error) {
    console.error("GitHub OAuth Callback Error:", error.message);
    return res.redirect(`${clientUrl}/login?error=github_auth_failed`);
  }
};