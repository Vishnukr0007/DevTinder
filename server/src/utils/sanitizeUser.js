/**
 * Sanitizes user objects by stripping sensitive fields like password,
 * reset password tokens, and email verification tokens.
 *
 * @param {Object|Array} data - User object or array of user objects
 * @returns {Object|Array} Sanitized data with sensitive fields removed
 */
export const sanitizeUser = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map(sanitizeUser);
  }

  if (typeof data === 'object') {
    const sanitized = { ...data };
    delete sanitized.password;
    delete sanitized.resetPasswordToken;
    delete sanitized.resetPasswordExpires;
    delete sanitized.resetPasswordUsedAt;
    delete sanitized.emailVerificationToken;
    delete sanitized.emailVerificationExpires;
    return sanitized;
  }

  return data;
};

export default sanitizeUser;
