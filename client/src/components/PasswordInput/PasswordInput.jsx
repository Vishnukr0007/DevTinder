import React, { useState } from "react";
import { validatePassword } from "../../utils/passwordUtils.js";

export const PasswordInput = ({
  id = "password",
  name = "password",
  value = "",
  onChange,
  placeholder = "Enter password",
  label = "Password",
  rightHeaderAction = null,
  required = false,
  showStrength = false,
  error = "",
  className = "",
  autoComplete = "current-password",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const strength = validatePassword(value);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between py-1">
          <label htmlFor={id} className="label-text font-bold text-base-content">
            {label}
          </label>
          {rightHeaderAction ? (
            rightHeaderAction
          ) : showStrength ? (
            <span className={`label-text-alt font-bold text-${strength.color}`}>
              {value ? `Strength: ${strength.label}` : ""}
            </span>
          ) : null}
        </div>
      )}

      <div className="relative w-full">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`input input-bordered rounded-xl w-full pr-11 transition-all ${
            error ? "input-error" : showStrength && value ? (strength.isStrong ? "input-success" : "input-warning") : ""
          }`}
        />

        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="aria-button absolute right-2 top-1/2 -translate-y-1/2 p-2 text-base-content/60 hover:text-base-content hover:bg-base-200/80 rounded-lg transition-colors focus:outline-none"
          title={showPassword ? "Hide password" : "Show password"}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            /* Eye Off Icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
              />
            </svg>
          ) : (
            /* Eye Icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          )}
        </button>
      </div>

      {showStrength && value && (
        <div className="mt-3 space-y-2 bg-base-200/50 p-3 rounded-xl border border-base-300">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-base-content/70">Password Strength</span>
            <span
              className={`font-bold px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${
                strength.color === "success"
                  ? "bg-success/20 text-success"
                  : strength.color === "warning"
                  ? "bg-warning/20 text-warning"
                  : "bg-error/20 text-error"
              }`}
            >
              {strength.label}
            </span>
          </div>

          <progress
            className={`progress progress-${strength.color} w-full h-2 rounded-full transition-all duration-300`}
            value={strength.score}
            max="5"
          ></progress>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs">
            {strength.criteria.map((item) => (
              <div
                key={item.key}
                className={`flex items-center gap-1.5 font-medium transition-colors ${
                  item.met ? "text-success font-semibold" : "text-base-content/40"
                }`}
              >
                <span>{item.met ? "✓" : "✕"}</span>
                <span className="text-[11px]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
