import React from "react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) => {
  const variantClass = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    accent: "btn-accent",
    outline: "btn-outline",
    ghost: "btn-ghost",
    error: "btn-error",
    success: "btn-success",
  }[variant] || "btn-primary";

  const sizeClass = {
    xs: "btn-xs",
    sm: "btn-sm",
    md: "btn-md",
    lg: "btn-lg",
  }[size] || "";

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
    >
      {loading ? <span className="loading loading-spinner loading-sm"></span> : children}
    </button>
  );
};

export default Button;
