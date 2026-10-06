/**
 * Password Strength & Validation Helper
 */
export const validatePassword = (password = "") => {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  const criteriaList = [
    { key: "minLength", label: "At least 8 characters", met: minLength },
    { key: "hasUppercase", label: "At least one uppercase letter (A-Z)", met: hasUppercase },
    { key: "hasLowercase", label: "At least one lowercase letter (a-z)", met: hasLowercase },
    { key: "hasNumber", label: "At least one number (0-9)", met: hasNumber },
    { key: "hasSpecialChar", label: "At least one special character (!@#$%^&*)", met: hasSpecialChar },
  ];

  const score = criteriaList.filter((item) => item.met).length;
  const isStrong = score === 5;

  let label = "Weak";
  let color = "error";

  if (score === 5) {
    label = "Strong";
    color = "success";
  } else if (score >= 3) {
    label = "Medium";
    color = "warning";
  }

  return {
    score,
    maxScore: 5,
    isStrong,
    label,
    color,
    criteria: criteriaList,
  };
};
