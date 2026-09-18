import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser } from "../../store/authSlice.js";
import Button from "../../components/Button/Button.jsx";
import SocialAuthButtons from "../../components/SocialAuthButtons/SocialAuthButtons.jsx";

export const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resultAction = await dispatch(loginUser(formData));
      if (loginUser.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        if (user?.role === "ADMIN") {
          navigate("/admin/dashboard");
        } else {
          navigate("/app/dashboard");
        }
      } else {
        setError(resultAction.payload || "Invalid email or password");
      }
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[75vh] px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 rounded-3xl p-8">
        <div className="text-center mb-6">
          <span className="text-4xl">🔥</span>
          <h2 className="text-2xl font-black text-base-content mt-2">Welcome Back</h2>
          <p className="text-xs text-base-content/60 mt-1">Login to your DevTinder developer account</p>
        </div>

        {error && (
          <div className="alert alert-error text-xs font-semibold mb-4 rounded-xl">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Email Address</span>
            </label>
            <input
              type="email"
              placeholder="alex.dev@example.com"
              required
              className="input input-bordered rounded-xl w-full"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label justify-between">
              <span className="label-text font-bold">Password</span>
              <Link to="/forgot-password" className="label-text-alt text-primary font-semibold hover:underline">
                Forgot?
              </Link>
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              className="input input-bordered rounded-xl w-full"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <Button type="submit" loading={loading} className="w-full rounded-xl btn-primary mt-2">
            Login to Account 🚀
          </Button>
        </form>

        <SocialAuthButtons />

        <div className="text-center mt-6 text-xs text-base-content/70">
          Don't have an account?{" "}
          <Link to="/signup" className="text-primary font-bold hover:underline">
            Create Developer Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
