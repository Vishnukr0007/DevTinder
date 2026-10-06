import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { authApi } from "../../services/authApi.js";
import Button from "../../components/Button/Button.jsx";
import PasswordInput from "../../components/PasswordInput/PasswordInput.jsx";
import { validatePassword } from "../../utils/passwordUtils.js";

export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setResetToken(tokenFromUrl.trim());
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!resetToken.trim()) {
      setError("Reset token is missing or invalid. Please check your reset link or request a new one.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please ensure both fields are identical.");
      return;
    }

    const pwdValidation = validatePassword(newPassword);
    if (!pwdValidation.isStrong) {
      setError("Please create a strong password meeting all 5 security criteria below.");
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword({
        resetToken: resetToken.trim(),
        newPassword,
      });

      if (res.success) {
        setSuccess(true);
        setMessage(res.message || "Password updated successfully!");
      } else {
        setError(res.message || "Failed to reset password.");
      }
    } catch (err) {
      setError(err.message || "Invalid or expired password reset token. Tokens expire in 15 minutes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 rounded-3xl p-6 sm:p-8">
        {!success ? (
          <>
            <div className="text-center mb-6">
              <span className="text-5xl">🔑</span>
              <h2 className="text-2xl font-black text-base-content mt-3">Set New Password</h2>
              <p className="text-xs text-base-content/60 mt-1">Enter a strong password to recover your account</p>
            </div>

            {error && (
              <div className="alert alert-error text-xs font-semibold mb-4 rounded-xl flex items-start gap-2 shadow-sm">
                <span>⚠️</span>
                <div className="flex-1">{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!searchParams.get("token") && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold text-xs">Reset Token</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Paste your reset token"
                    required
                    className="input input-bordered rounded-xl w-full font-mono text-xs"
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                  />
                </div>
              )}

              <PasswordInput
                id="reset-new-password"
                name="newPassword"
                label="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                required
                showStrength={true}
                autoComplete="new-password"
              />

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-xs">Confirm New Password</span>
                </label>
                <input
                  type="password"
                  placeholder="Re-enter new password"
                  required
                  className="input input-bordered rounded-xl w-full"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <span className="text-error text-xs mt-1 font-medium">❌ Passwords do not match</span>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <span className="text-success text-xs mt-1 font-medium">✓ Passwords match</span>
                )}
              </div>

              <Button type="submit" loading={loading} className="w-full rounded-xl btn-primary mt-2">
                Reset Password 🚀
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            <h2 className="text-2xl font-black text-base-content">Password Reset Successful!</h2>
            <p className="text-xs text-base-content/70">
              Your password has been updated. You can now log in with your new password.
            </p>

            <Link to="/login" className="btn btn-primary rounded-xl w-full mt-4">
              Go to Login 🚀
            </Link>
          </div>
        )}

        <div className="text-center mt-6 text-xs">
          <Link to="/login" className="text-primary font-bold hover:underline">
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
