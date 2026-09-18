import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { signupUser } from "../../store/authSlice.js";
import Button from "../../components/Button/Button.jsx";
import SocialAuthButtons from "../../components/SocialAuthButtons/SocialAuthButtons.jsx";

export const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const resultAction = await dispatch(signupUser(formData));
      if (signupUser.fulfilled.match(resultAction)) {
        navigate("/app/dashboard");
      } else {
        setError(resultAction.payload || "Registration failed. Please check inputs.");
      }
    } catch (err) {
      setError(err.message || "Registration failed. Please check inputs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4 py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl border border-base-300 rounded-3xl p-8">
        <div className="text-center mb-6">
          <span className="text-4xl">🚀</span>
          <h2 className="text-2xl font-black text-base-content mt-2">Join DevTinder</h2>
          <p className="text-xs text-base-content/60 mt-1">Connect with developers & start pair building</p>
        </div>

        {error && (
          <div className="alert alert-error text-xs font-semibold mb-4 rounded-xl">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">First Name</span>
              </label>
              <input
                type="text"
                placeholder="Alex"
                required
                className="input input-bordered rounded-xl w-full"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold">Last Name</span>
              </label>
              <input
                type="text"
                placeholder="Dev"
                required
                className="input input-bordered rounded-xl w-full"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

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
            <label className="label">
              <span className="label-text font-bold">Password</span>
            </label>
            <input
              type="password"
              placeholder="Min 6 characters"
              required
              minLength={6}
              className="input input-bordered rounded-xl w-full"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <Button type="submit" loading={loading} className="w-full rounded-xl btn-primary mt-2">
            Create Developer Account 🎉
          </Button>
        </form>

        <SocialAuthButtons title="Or sign up with" />

        <div className="text-center mt-6 text-xs text-base-content/70">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-bold hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
