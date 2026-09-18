import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar/Navbar.jsx";
import Footer from "../components/Footer/Footer.jsx";
import Loader from "../components/Loader/Loader.jsx";

export const UserLayout = () => {
  const { user, loading } = useSelector((state) => state.auth);

  if (loading) {
    return <Loader fullScreen text="Authenticating session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200/50 font-sans antialiased text-base-content">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
