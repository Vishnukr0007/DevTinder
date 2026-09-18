import React from "react";
import { Outlet, Navigate, Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar/Navbar.jsx";
import Loader from "../components/Loader/Loader.jsx";

export const AdminLayout = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen text="Verifying Admin credentials..." />;
  }

  if (!user || !isAdmin) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-base-200">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 gap-6">
        {/* Admin Sidebar */}
        <aside className="w-64 hidden md:block bg-base-100 p-4 rounded-2xl shadow-sm border border-base-300 h-fit space-y-2">
          <div className="px-3 py-2 border-b border-base-200 mb-2">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-primary">👑 Admin Control Panel</h3>
            <p className="text-xs text-base-content/60 mt-0.5">Platform Management</p>
          </div>
          <ul className="menu menu-sm w-full gap-1">
            <li>
              <Link to="/admin/dashboard" className={isActive("/admin/dashboard") ? "active font-bold" : ""}>
                📊 Dashboard Stats
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className={isActive("/admin/users") ? "active font-bold" : ""}>
                👥 User Management
              </Link>
            </li>
            <li>
              <Link to="/admin/reports" className={isActive("/admin/reports") ? "active font-bold" : ""}>
                🚩 Moderation & Reports
              </Link>
            </li>
            <li>
              <Link to="/admin/settings" className={isActive("/admin/settings") ? "active font-bold" : ""}>
                ⚙️ Platform Settings
              </Link>
            </li>
          </ul>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 bg-base-100 p-6 rounded-2xl shadow-sm border border-base-300 min-h-[500px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
