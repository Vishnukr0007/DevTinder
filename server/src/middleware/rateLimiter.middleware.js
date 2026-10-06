import rateLimit from "express-rate-limit";

/**
 * Rate Limiter for Password Reset Requests
 * Limits to 5 requests per 15-minute window per IP to prevent spam / enumeration attacks.
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    success: false,
    message: "Too many password reset requests from this IP address. Please try again after 15 minutes.",
  },
});
