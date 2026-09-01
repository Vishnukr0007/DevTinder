import React from 'react'

const NavBar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-base-300 bg-base-100/80 backdrop-blur-md">
      <nav className="navbar mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Main Navigation">
        {/* Navbar Start: Brand Logo & Mobile Menu */}
        <div className="navbar-start gap-2">
          {/* Mobile Dropdown */}
          <details className="dropdown lg:hidden">
            <summary className="btn btn-ghost btn-circle" aria-label="Open mobile menu">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box border border-base-200 z-50 mt-3 w-56 p-2 shadow-xl">
              <li>
                <a href="#discover" className="font-medium">
                  🔥 Discover
                </a>
              </li>
              <li>
                <a href="#matches" className="flex justify-between font-medium">
                  💬 Matches
                  <span className="badge badge-primary badge-sm">3</span>
                </a>
              </li>
              <li>
                <a href="#projects" className="font-medium">
                  💻 Projects
                </a>
              </li>
              <li>
                <a href="#community" className="font-medium">
                  🌐 Community
                </a>
              </li>
            </ul>
          </details>

          {/* Logo */}
          <a href="/" className="btn btn-ghost gap-2 px-2 text-xl font-bold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-content shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path d="M12.378 1.602a.75.75 0 0 0-.756 0A9.014 9.014 0 0 0 7.5 9.387v.613a4.5 4.5 0 0 0 4.5 4.5h.001a4.5 4.5 0 0 0 4.499-4.5v-.613c0-3.328-1.782-6.38-4.122-7.785ZM6 10.5a6 6 0 0 1 6-6 6 6 0 0 1 6 6v.5a6 6 0 1 1-12 0v-.5Z" />
                <path d="M12 13.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z" />
              </svg>
            </span>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DevTinder
            </span>
            <span className="badge badge-soft badge-primary badge-xs hidden sm:inline-flex">
              v1.0
            </span>
          </a>
        </div>

        {/* Navbar Center: Desktop Navigation Links */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-1 px-1 font-medium">
            <li>
              <a href="#discover" className="btn-active:bg-base-200 rounded-lg">
                🔥 Discover
              </a>
            </li>
            <li>
              <a href="#matches" className="flex items-center gap-1.5 rounded-lg">
                💬 Matches
                <span className="badge badge-primary badge-sm">3</span>
              </a>
            </li>
            <li>
              <a href="#projects" className="rounded-lg">
                💻 Pair Projects
              </a>
            </li>
            <li>
              <a href="#community" className="rounded-lg">
                🌐 Community
              </a>
            </li>
          </ul>
        </div>

        {/* Navbar End: Search, Notifications & User Avatar Dropdown */}
        <div className="navbar-end gap-2">
          {/* Notifications Button */}
          <button
            type="button"
            className="btn btn-ghost btn-circle btn-sm sm:btn-md"
            aria-label="Notifications"
          >
            <div className="indicator">
              <span className="indicator-item badge badge-primary badge-xs"></span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 opacity-80"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
          </button>

          {/* User Profile Dropdown */}
          <details className="dropdown dropdown-end">
            <summary
              className="btn btn-ghost btn-circle avatar avatar-online border-2 border-primary/30"
              aria-label="User profile settings"
            >
              <div className="w-9 rounded-full">
                <img
                  alt="Developer Profile"
                  src="https://picsum.photos/200/200?random=42"
                />
              </div>
            </summary>
            <ul className="menu dropdown-content bg-base-100 rounded-box border border-base-200 z-50 mt-3 w-60 p-2 shadow-2xl">
              <li className="menu-title px-3 py-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-base-content">Alex Rivera</span>
                  <span className="text-xs text-base-content/60">Full-Stack Engineer</span>
                  <span className="badge badge-success badge-soft badge-xs mt-1 w-fit">
                    Open for Pairing
                  </span>
                </div>
              </li>
              <div className="divider my-1"></div>
              <li>
                <a href="#profile" className="flex items-center justify-between">
                  <span>👤 My Profile</span>
                  <span className="badge badge-ghost badge-xs">85% Complete</span>
                </a>
              </li>
              <li>
                <a href="#stacks">⚡ Tech Stack & Tags</a>
              </li>
              <li>
                <a href="#bookmarks">⭐ Saved Devs</a>
              </li>
              <li>
                <a href="#settings">⚙️ Settings</a>
              </li>
              <div className="divider my-1"></div>
              <li>
                <a href="#logout" className="text-error hover:bg-error/10">
                  🚪 Sign Out
                </a>
              </li>
            </ul>
          </details>
        </div>
      </nav>
    </header>
  )
}

export default NavBar