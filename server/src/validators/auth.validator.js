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

  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
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

  if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
    return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" });
  }

  next();
};
