import React from "react";

export const Footer = () => {
  return (
    <footer className="footer footer-center bg-base-200 text-base-content p-8 border-t border-base-300 mt-auto">
      <aside className="space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-extrabold text-primary tracking-tight">DevTinder</span>
        </div>
        <p className="text-sm font-medium text-base-content/70">
          Developer Discovery • Matchmaking • Real-time Chat • Project Collaboration
        </p>
        <p className="text-xs text-base-content/50">
          © {new Date().getFullYear()} DevTinder Inc. All rights reserved.
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
