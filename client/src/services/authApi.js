import { fetchApi } from "./api.js";

export const authApi = {
  signup: (userData) => fetchApi("/auth/signup", { method: "POST", body: userData }),
  login: (credentials) => fetchApi("/auth/login", { method: "POST", body: credentials }),
  logout: () => fetchApi("/auth/logout", { method: "POST" }),
  getMe: () => fetchApi("/auth/me", { method: "GET" }),
  forgotPassword: (data) => fetchApi("/auth/forgot-password", { method: "POST", body: data }),
  verifyOtp: (data) => fetchApi("/auth/verify-otp", { method: "POST", body: data }),
  resetPassword: (data) => fetchApi("/auth/reset-password", { method: "POST", body: data }),
  sendVerification: (data) => fetchApi("/auth/send-verification", { method: "POST", body: data }),
  verifyEmail: (data) => fetchApi("/auth/verify-email", { method: "POST", body: data }),
};
