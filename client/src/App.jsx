import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider, useDispatch } from "react-redux";
import { store } from "./store/store.js";
import { fetchCurrentUser } from "./store/authSlice.js";

// Layouts
import PublicLayout from "./layouts/PublicLayout.jsx";
import UserLayout from "./layouts/UserLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

// Public Pages
import Landing from "./Pages/public/Landing.jsx";
import Login from "./Pages/public/Login.jsx";
import Signup from "./Pages/public/Signup.jsx";
import ForgotPassword from "./Pages/public/ForgotPassword.jsx";

// User Pages
import UserDashboard from "./Pages/user/Dashboard.jsx";
import Discover from "./Pages/user/Discover.jsx";
import Profile from "./Pages/user/Profile.jsx";
import Connections from "./Pages/user/Connections.jsx";
import Messages from "./Pages/user/Messages.jsx";
import Projects from "./Pages/user/Projects.jsx";
import UserSettings from "./Pages/user/Settings.jsx";

// Admin Pages
import AdminDashboard from "./Pages/admin/Dashboard.jsx";
import AdminUsers from "./Pages/admin/Users.jsx";
import AdminReports from "./Pages/admin/Reports.jsx";
import AdminSettings from "./Pages/admin/Settings.jsx";

function AppContent() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  return (
    <BrowserRouter basename="/">
      <Routes>
        {/* Public Routes */}
        <Route element={<PublicLayout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* Authenticated Developer Routes */}
        <Route path="app" element={<UserLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="discover" element={<Discover />} />
          <Route path="profile" element={<Profile />} />
          <Route path="connections" element={<Connections />} />
          <Route path="messages" element={<Messages />} />
          <Route path="projects" element={<Projects />} />
          <Route path="settings" element={<UserSettings />} />
        </Route>

        {/* Platform Admin Routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Fallback Catch-all Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
