import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authApi } from "../../services/authApi.js";
import Button from "../../components/Button/Button.jsx";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1); // 1: Email, 2: Reset
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequestToken = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email });
      if (res.success) {
        setMessage(res.message);
        if (res.resetToken) {
          setResetToken(res.resetToken);
          setStep(2);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to generate password reset token");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await authApi.resetPassword({ resetToken, newPassword });
      if (res.success) {
        setMessage(res.message);
        setStep(3); // Complete
      }
    } catch (err) {
      setError(err.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[75vh] px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 rounded-3xl p-8">
        <div className="text-center mb-6">
          <span className="text-4xl">🔐</span>
          <h2 className="text-2xl font-black text-base-content mt-2">Password Recovery</h2>
          <p className="text-xs text-base-content/60 mt-1">Reset your DevTinder developer account password</p>
        </div>

        {message && (
          <div className="alert alert-success text-xs font-semibold mb-4 rounded-xl">
            <span>✅ {message}</span>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-xs font-semibold mb-4 rounded-xl">
            <span>⚠️ {error}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestToken} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Your Registered Email</span>
              </label>
              <input
                type="email"
                placeholder="alex.dev@example.com"
                required
                className="input input-bordered rounded-xl w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" loading={loading} className="w-full rounded-xl btn-primary">
              Send Reset Token 🔑
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Reset Token</span>
              </label>
              <input
                type="text"
                required
                className="input input-bordered rounded-xl w-full font-mono text-xs"
                value={resetToken}
                onChange={(e) => setResetToken(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">New Password</span>
              </label>
              <input
                type="password"
                placeholder="Min 6 characters"
                required
                minLength={6}
                className="input input-bordered rounded-xl w-full"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit" loading={loading} className="w-full rounded-xl btn-primary">
              Update Password 🚀
            </Button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center space-y-4">
            <p className="text-sm text-base-content/80">Your password has been successfully updated!</p>
            <Link to="/login" className="btn btn-primary rounded-xl w-full">
              Proceed to Login 🚀
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

export default ForgotPassword;
