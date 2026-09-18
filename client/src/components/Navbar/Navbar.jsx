import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../store/authSlice.js";

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="navbar bg-base-100/90 backdrop-blur-md sticky top-0 z-40 border-b border-base-200 px-4 lg:px-8 shadow-xs">
      <div className="navbar-start">
        {/* Mobile menu dropdown */}
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow-lg border border-base-200">
            {user ? (
              <>
                <li><Link to="/app/discover">🔍 Discover</Link></li>
                <li><Link to="/app/connections">🤝 Connections</Link></li>
                <li><Link to="/app/messages">💬 Messages</Link></li>
                <li><Link to="/app/projects">🛠️ Projects</Link></li>
                {isAdmin && <li><Link to="/admin/dashboard" className="text-primary font-bold">👑 Admin Panel</Link></li>}
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/signup">Signup</Link></li>
              </>
            )}
          </ul>
        </div>

        <Link to={user ? "/app/dashboard" : "/"} className="btn btn-ghost text-xl font-black text-primary gap-1">
          🔥 DevTinder
        </Link>
      </div>

      {/* Desktop navigation */}
      <div className="navbar-center hidden lg:flex">
        {user && (
          <ul className="menu menu-horizontal px-1 gap-1 font-semibold text-sm">
            <li>
              <Link to="/app/discover" className={isActive("/app/discover") ? "active font-bold" : ""}>
                🔍 Discover
              </Link>
            </li>
            <li>
              <Link to="/app/connections" className={isActive("/app/connections") ? "active font-bold" : ""}>
                🤝 Connections
              </Link>
            </li>
            <li>
              <Link to="/app/messages" className={isActive("/app/messages") ? "active font-bold" : ""}>
                💬 Messages
              </Link>
            </li>
            <li>
              <Link to="/app/projects" className={isActive("/app/projects") ? "active font-bold" : ""}>
                🛠️ Projects
              </Link>
            </li>
            {isAdmin && (
              <li>
                <Link to="/admin/dashboard" className="btn btn-xs btn-outline btn-primary ml-2">
                  👑 Admin Panel
                </Link>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="navbar-end gap-2">
        {user ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full ring-2 ring-primary">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email)}`}
                  alt="Profile"
                />
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow-xl border border-base-200">
              <li className="menu-title px-4 py-2 border-b border-base-200">
                <span className="font-bold text-base-content block">{user.firstName} {user.lastName}</span>
                <span className="text-xs text-base-content/60 block">{user.email}</span>
              </li>
              <li><Link to="/app/profile">👤 My Profile & Skills</Link></li>
              <li><Link to="/app/settings">⚙️ Settings</Link></li>
              <li className="border-t border-base-200 mt-1">
                <button onClick={handleLogout} className="text-error font-medium">🚪 Logout</button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
