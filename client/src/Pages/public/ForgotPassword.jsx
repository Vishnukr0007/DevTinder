import React, { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { authApi } from "../../services/authApi.js";
import Button from "../../components/Button/Button.jsx";
import PasswordInput from "../../components/PasswordInput/PasswordInput.jsx";
import { validatePassword } from "../../utils/passwordUtils.js";

export const ForgotPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Step state: 1 = Email Input, 2 = OTP Verification, 3 = New Password Input, 4 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  // Handle URL query parameters for direct links
  useEffect(() => {
    const emailFromUrl = searchParams.get("email");
    const otpFromUrl = searchParams.get("otp");
    const tokenFromUrl = searchParams.get("token");

    if (tokenFromUrl) {
      setResetToken(tokenFromUrl.trim());
      setStep(3);
    } else if (emailFromUrl && otpFromUrl) {
      setEmail(emailFromUrl);
      setOtp(otpFromUrl);
      setStep(2);
    } else if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
  }, [searchParams]);

  // Resend OTP countdown timer
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  // Step 1: Send OTP to Email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      if (res.success) {
        setStep(2);
        setMessage(res.message || "A 6-digit OTP code has been sent to your email.");
        setResendTimer(30);
      } else {
        setError(res.message || "Failed to send OTP code. Please check your email.");
      }
    } catch (err) {
      setError(err.message || "Failed to send OTP code. Please check your email address.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify 6-digit OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.verifyOtp({
        email: email.trim(),
        otp: otp.trim(),
      });

      if (res.success && res.resetToken) {
        setResetToken(res.resetToken);
        setStep(3);
        setMessage("OTP verified successfully! Please enter your new password below.");
      } else {
        setError(res.message || "Invalid or expired OTP code.");
      }
    } catch (err) {
      setError(err.message || "Invalid or expired OTP code. Please check your code and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP trigger
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await authApi.forgotPassword({ email: email.trim() });
      if (res.success) {
        setMessage("A fresh 6-digit OTP code has been dispatched to your email.");
        setResendTimer(30);
      } else {
        setError(res.message || "Failed to resend OTP.");
      }
    } catch (err) {
      setError(err.message || "Failed to resend OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Set New Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!resetToken) {
      setError("Reset session expired. Please verify your OTP again.");
      setStep(2);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please make sure both fields are identical.");
      return;
    }

    const pwdValidation = validatePassword(newPassword);
    if (!pwdValidation.isStrong) {
      setError("Please create a strong password meeting all 5 criteria below.");
      return;
    }

    setLoading(true);

    try {
      const res = await authApi.resetPassword({
        resetToken,
        newPassword,
      });

      if (res.success) {
        setStep(4);
        setMessage("Password updated successfully!");
      } else {
        setError(res.message || "Failed to reset password.");
      }
    } catch (err) {
      setError(err.message || "Failed to reset password. Please request a new OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-8">
      <div className="card w-full max-w-lg bg-base-100 shadow-2xl border border-base-300 rounded-3xl p-6 sm:p-8">
        {/* Progress Steps Header */}
        <div className="mb-6">
          <ul className="steps steps-horizontal w-full text-xs font-semibold">
            <li className={`step ${step >= 1 ? "step-primary" : ""}`}>Email</li>
            <li className={`step ${step >= 2 ? "step-primary" : ""}`}>Verify OTP</li>
            <li className={`step ${step >= 3 ? "step-primary" : ""}`}>New Password</li>
          </ul>
        </div>

        {/* Global Notifications */}
        {message && (
          <div className="alert alert-success text-xs font-semibold mb-4 rounded-xl flex items-start gap-2 shadow-sm">
            <span>✅</span>
            <div className="flex-1">{message}</div>
          </div>
        )}

        {error && (
          <div className="alert alert-error text-xs font-semibold mb-4 rounded-xl flex items-start gap-2 shadow-sm">
            <span>⚠️</span>
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* STEP 1: ENTER EMAIL */}
        {step === 1 && (
          <>
            <div className="text-center mb-6">
              <span className="text-5xl">🔐</span>
              <h2 className="text-2xl font-black text-base-content mt-3">Forgot Password?</h2>
              <p className="text-xs text-base-content/60 mt-1">
                Enter your registered email address and we'll send a 6-digit OTP code to verify your identity.
              </p>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-xs">Registered Email Address</span>
                </label>
                <input
                  type="email"
                  placeholder="developer@example.com"
                  required
                  className="input input-bordered rounded-xl w-full text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    We will send a 6-digit OTP code to this email.
                  </span>
                </label>
              </div>

              <Button type="submit" loading={loading} className="w-full rounded-xl btn-primary">
                Send OTP Code 📩
              </Button>
            </form>
          </>
        )}

        {/* STEP 2: ENTER & VERIFY OTP */}
        {step === 2 && (
          <>
            <div className="text-center mb-6">
              <span className="text-5xl">🛡️</span>
              <h2 className="text-2xl font-black text-base-content mt-3">Verify OTP Code</h2>
              <p className="text-xs text-base-content/60 mt-1">
                Enter the 6-digit verification code sent to <strong className="text-base-content font-mono">{email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold text-xs">Enter 6-Digit OTP</span>
                </label>
                <input
                  type="text"
                  maxLength="6"
                  placeholder="• • • • • •"
                  required
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="numeric"
                  className="input input-bordered rounded-xl w-full text-center font-mono text-2xl font-bold tracking-[0.5em] py-3 text-primary border-2 focus:border-primary"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    OTP is valid for 15 minutes.
                  </span>
                </label>
              </div>

              <Button type="submit" loading={loading} className="w-full rounded-xl btn-primary">
                Verify OTP Code ✅
              </Button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp("");
                    setError("");
                  }}
                  className="text-base-content/70 hover:text-primary transition-colors font-semibold"
                >
                  ← Change Email Address
                </button>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendTimer > 0 || loading}
                  className={`font-bold transition-colors ${
                    resendTimer > 0 ? "text-base-content/40 cursor-not-allowed" : "text-primary hover:underline"
                  }`}
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP 🔄"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 3: PROVIDE NEW PASSWORD FIELDS */}
        {step === 3 && (
          <>
            <div className="text-center mb-6">
              <span className="text-5xl">🔑</span>
              <h2 className="text-2xl font-black text-base-content mt-3">Set New Password</h2>
              <p className="text-xs text-base-content/60 mt-1">
                Your OTP was verified! Choose a strong new password for your account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
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
                  <span className="text-error text-xs mt-1 font-medium">✕ Passwords do not match</span>
                )}
                {confirmPassword && newPassword === confirmPassword && (
                  <span className="text-success text-xs mt-1 font-medium">✓ Passwords match</span>
                )}
              </div>

              <Button type="submit" loading={loading} className="w-full rounded-xl btn-primary mt-2">
                Reset Password & Finish 🚀
              </Button>
            </form>
          </>
        )}

        {/* STEP 4: SUCCESS / COMPLETE */}
        {step === 4 && (
          <div className="text-center space-y-4 py-4">
            <div className="w-20 h-20 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto text-4xl font-bold shadow-inner">
              ✓
            </div>
            <h2 className="text-2xl font-black text-base-content">Password Reset Complete!</h2>
            <p className="text-xs text-base-content/70 leading-relaxed">
              Your password has been successfully updated. You can now log into your DevTinder developer account using your new credentials.
            </p>

            <Link to="/login" className="btn btn-primary rounded-xl w-full mt-4 text-sm font-bold shadow-md">
              Go to Login 🚀
            </Link>
          </div>
        )}

        {step !== 4 && (
          <div className="text-center mt-6 text-xs">
            <Link to="/login" className="text-primary font-bold hover:underline">
              ← Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;


