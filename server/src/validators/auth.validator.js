const isStrongPassword = (password) => {
  if (!password || typeof password !== "string") return false;
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  return minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;
};

export const validateSignup = (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || typeof firstName !== "string" || firstName.trim() === "") {
    return res.status(400).json({ success: false, message: "Valid first name is required" });
  }

  if (!lastName || typeof lastName !== "string" || lastName.trim() === "") {
    return res.status(400).json({ success: false, message: "Valid last name is required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "A valid email address is required" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "A valid email address is required" });
  }

  if (!password || typeof password !== "string" || password.trim() === "") {
    return res.status(400).json({ success: false, message: "Password is required" });
  }

  next();
};

export const validateForgotPassword = (req, res, next) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ success: false, message: "A valid registered email address is required" });
  }
  next();
};

export const validateResetPassword = (req, res, next) => {
  const { resetToken, newPassword } = req.body;

  if (!resetToken || typeof resetToken !== "string" || resetToken.trim() === "") {
    return res.status(400).json({ success: false, message: "Reset token is required" });
  }

  if (!isStrongPassword(newPassword)) {
    return res.status(400).json({
      success: false,
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
    });
  }

  next();
};
