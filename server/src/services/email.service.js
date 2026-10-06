import { Resend } from "resend";
import nodemailer from "nodemailer";
import { env } from "../config/env.js";

/**
 * Initialize Email Clients:
 * 1. Resend SDK (if RESEND_API_KEY is present)
 * 2. Nodemailer Transporter (if SMTP credentials are present)
 * 3. Dev Logger Transporter (Fallback for local dev)
 */
let resendClient = null;
let nodemailerTransporter = null;

const getResendClient = () => {
  const apiKey = env.RESEND_API_KEY || process.env.RESEND_API_KEY;
  if (apiKey && !resendClient) {
    resendClient = new Resend(apiKey);
    console.log("🚀 [EMAIL SERVICE] Initialized Resend SDK for transactional emails.");
  }
  return resendClient;
};

const getNodemailerTransporter = async () => {
  if (nodemailerTransporter) return nodemailerTransporter;

  const smtpHost = env.SMTP_HOST || process.env.SMTP_HOST;
  const smtpUser = env.SMTP_USER || process.env.SMTP_USER;
  const smtpPass = env.SMTP_PASS || process.env.SMTP_PASS;

  if (smtpHost && smtpUser) {
    const isPort465 = Number(env.SMTP_PORT || process.env.SMTP_PORT) === 465;
    const isSecure = env.SMTP_SECURE === true || process.env.SMTP_SECURE === "true" || isPort465;

    nodemailerTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(env.SMTP_PORT || process.env.SMTP_PORT) || 587,
      secure: isSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(`📧 [EMAIL SERVICE] Configured Nodemailer SMTP via ${smtpHost}:${Number(env.SMTP_PORT || process.env.SMTP_PORT) || 587}`);
  } else {
    nodemailerTransporter = nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  return nodemailerTransporter;
};

/**
 * Unified Dispatch Function
 */
const dispatchEmail = async ({ to, subject, html, text }) => {
  let rawFrom = env.EMAIL_FROM || process.env.EMAIL_FROM || "DevTinder Support <onboarding@resend.dev>";
  rawFrom = rawFrom.replace(/;+$/, "").replace(/\.$/, "").replace(/^["']|["']$/g, "").trim();

  const replyTo = process.env.REPLY_TO || rawFrom;

  const resend = getResendClient();

  // Mode 1: Resend SDK
  if (resend) {
    try {
      // Resend free tier requires sending from onboarding@resend.dev unless a custom domain is verified
      let resendFrom = rawFrom;
      if (!resendFrom.includes("resend.dev") && !process.env.RESEND_DOMAIN_VERIFIED) {
        resendFrom = "DevTinder Support <onboarding@resend.dev>";
      }

      const response = await resend.emails.send({
        from: resendFrom,
        to: [to],
        reply_to: replyTo,
        subject,
        html,
        text,
        headers: {
          "X-Entity-Ref-ID": `devtinder-${Date.now()}`,
        },
      });

      if (response.error) {
        console.error("❌ [RESEND SDK ERROR]:", response.error.message || response.error);
        if (response.error.message?.includes("only send testing emails") || response.error.statusCode === 403) {
          console.warn("⚠️ [RESEND DOMAIN/RECIPIENT RESTRICTION]: Resend free tier only sends emails to your registered Resend account address. To send to any recipient, configure SMTP credentials (e.g. Gmail/SMTP) in server/.env or verify your domain in Resend.");
        }
      } else if (response.data) {
        console.log(`✉️ [RESEND SDK] Email successfully sent to ${to}. ID:`, response.data.id);
        return { success: true, id: response.data.id, provider: "RESEND" };
      }
    } catch (err) {
      console.error("❌ [RESEND SDK EXCEPTION]:", err.message);
    }
  }

  // Mode 2: Nodemailer (SMTP or Dev Logger)
  const smtpHost = env.SMTP_HOST || process.env.SMTP_HOST;
  const smtpUser = env.SMTP_USER || process.env.SMTP_USER;
  const isRealSmtp = Boolean(smtpHost && smtpUser);

  try {
    const transporter = await getNodemailerTransporter();
    const info = await transporter.sendMail({
      from: rawFrom,
      to,
      replyTo,
      subject,
      text,
      html,
      headers: {
        "X-Entity-Ref-ID": `devtinder-${Date.now()}`,
      },
    });

    if (isRealSmtp) {
      console.log(`✉️ [SMTP] Email successfully dispatched to ${to} via ${smtpHost}`);
      return { success: true, messageId: info.messageId, provider: "SMTP" };
    } else {
      console.warn(`⚠️ [DEV FALLBACK] Email dispatched via dev transport for recipient: ${to}`);
      return { success: false, messageId: info.messageId, provider: "DEV_LOGGER", isDevFallback: true };
    }
  } catch (smtpErr) {
    console.error("❌ [SMTP ERROR]:", smtpErr.message);
    return { success: false, error: smtpErr.message };
  }
};

/**
 * Send Password Reset Email with OTP Code
 * @param {Object} options
 * @param {string} options.toEmail
 * @param {string} options.userName
 * @param {string} options.otpCode
 * @param {string} options.resetToken
 * @param {string} options.resetUrl
 */
export const sendPasswordResetEmail = async ({ toEmail, userName = "Developer", otpCode, resetToken, resetUrl }) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 32px 24px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
          .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; }
          .otp-container { background: #f8fafc; border: 2px dashed #6366f1; border-radius: 14px; padding: 24px 16px; text-align: center; margin: 24px 0; }
          .otp-label { font-size: 13px; text-transform: uppercase; letter-spacing: 1.5px; color: #64748b; font-weight: 700; display: block; margin-bottom: 8px; }
          .otp-code { font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #4f46e5; display: inline-block; background: #ffffff; padding: 8px 24px; border-radius: 10px; border: 1px solid #cbd5e1; }
          .btn-container { text-align: center; margin: 24px 0; }
          .btn { background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
          .token-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; font-family: monospace; font-size: 13px; word-break: break-all; margin-top: 16px; color: #475569; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
          .warning { font-size: 13px; color: #ef4444; margin-top: 20px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DevTinder ⚡</h1>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Password Reset Verification OTP</p>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>We received a request to reset your DevTinder developer account password. Use the 6-digit OTP code below to verify your identity and reset your password:</p>
            
            <div class="otp-container">
              <span class="otp-label">Your Verification OTP Code</span>
              <span class="otp-code">${otpCode || "123456"}</span>
              <p style="font-size: 12px; color: #64748b; margin-top: 10px; margin-bottom: 0;">This OTP code will expire in 15 minutes.</p>
            </div>

            <p style="font-size: 14px; text-align: center;">Alternatively, click the button below to open the reset page directly:</p>
            <div class="btn-container">
              <a href="${resetUrl}" target="_blank" class="btn">Reset My Password 🔑</a>
            </div>

            <p class="warning">⚠️ Never share this OTP code or link with anyone for security purposes.</p>
            <p style="font-size: 13px; color: #64748b; margin-top: 20px;">If you did not request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} DevTinder. Built for Developers.
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `Hi ${userName},\n\nYour DevTinder password reset OTP code is: ${otpCode}\n\nOr reset via link:\n${resetUrl}\n\nThis OTP will expire in 15 minutes.`;

    const result = await dispatchEmail({
      to: toEmail,
      subject: `🔑 ${otpCode} is your DevTinder Password Reset OTP`,
      html: htmlContent,
      text: textContent,
    });

    // Console banner log for dev transparency
    console.log("\n======================================================================");
    console.log(`🔑 [PASSWORD RESET OTP DISPATCHED]`);
    console.log(`To: ${toEmail}`);
    console.log(`OTP Code: ${otpCode}`);
    console.log(`Reset Link: ${resetUrl}`);
    if (!env.RESEND_API_KEY && !process.env.RESEND_API_KEY && !env.SMTP_HOST && !process.env.SMTP_HOST) {
      console.log(`💡 (Add RESEND_API_KEY to server/.env for direct inbox email delivery)`);
    }
    console.log("======================================================================\n");

    return result;
  } catch (error) {
    console.error("❌ [PASSWORD RESET EMAIL ERROR]:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send Account Verification / Welcome Email
 * @param {Object} options
 * @param {string} options.toEmail
 * @param {string} options.userName
 * @param {string} options.verificationUrl
 */
export const sendWelcomeVerificationEmail = async ({ toEmail, userName = "Developer", verificationUrl }) => {
  try {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #333; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); border: 1px solid #e5e7eb; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); padding: 32px 24px; text-align: center; color: white; }
          .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
          .content { padding: 32px 28px; line-height: 1.6; font-size: 15px; }
          .btn-container { text-align: center; margin: 28px 0; }
          .btn { background: #6366f1; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
          .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #f1f5f9; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to DevTinder ⚡</h1>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Connect, Match & Build with Developers</p>
          </div>
          <div class="content">
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Thank you for registering on DevTinder! We are excited to have you join our global developer community.</p>
            <p>Please click the button below to verify your email address and activate all developer collaboration features:</p>
            
            <div class="btn-container">
              <a href="${verificationUrl}" target="_blank" class="btn">Verify My Email ✅</a>
            </div>

            <p style="font-size: 13px; color: #64748b;">Or copy and paste this link into your browser:</p>
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 12px; font-family: monospace; font-size: 13px; word-break: break-all; color: #475569;">${verificationUrl}</div>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} DevTinder. Built for Developers worldwide.
          </div>
        </div>
      </body>
      </html>
    `;

    const textContent = `Hi ${userName},\n\nWelcome to DevTinder! Click the link below to verify your account:\n${verificationUrl}`;

    return await dispatchEmail({
      to: toEmail,
      subject: "⚡ Welcome to DevTinder - Verify Your Email",
      html: htmlContent,
      text: textContent,
    });
  } catch (error) {
    console.error("❌ [WELCOME EMAIL ERROR]:", error);
    return { success: false, error: error.message };
  }
};



