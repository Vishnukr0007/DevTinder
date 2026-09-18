import React from "react";
import { Link } from "react-router-dom";

export const Landing = () => {
  return (
    <div className="space-y-24 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="hero min-h-[70vh] bg-gradient-to-b from-primary/10 via-base-100 to-base-100 rounded-3xl p-8 border border-base-200 text-center">
        <div className="hero-content flex-col max-w-4xl">
          <span className="badge badge-primary badge-outline px-4 py-3 text-sm font-semibold uppercase tracking-wider mb-4 animate-bounce">
            🔥 The Tinder for Developers & Builders
          </span>
          <h1 className="text-5xl sm:text-6xl font-black text-base-content tracking-tight leading-tight">
            Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">Coding Match</span> & Co-Founder
          </h1>
          <p className="py-6 text-lg text-base-content/70 max-w-2xl mx-auto leading-relaxed">
            Stop searching in noisy forums. Swipe through verified developer profiles, match based on tech stack synergy, chat in real-time, and build dream projects together.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/signup" className="btn btn-primary btn-lg shadow-lg shadow-primary/30 rounded-2xl px-8">
              Get Started for Free 🚀
            </Link>
            <Link to="/login" className="btn btn-outline btn-lg rounded-2xl px-8">
              Login to Account
            </Link>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-base-content">7 Pillars of DevTinder</h2>
          <p className="text-sm text-base-content/60 mt-2">Everything you need to discover, connect, and collaborate with top software engineers.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card bg-base-100 border border-base-300 shadow-xl p-6 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Developer Discovery</h3>
            <p className="text-sm text-base-content/70">Swipe through curated developer cards, filter by tech stack, experience level, and pair programming availability.</p>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-xl p-6 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-bold mb-2">Skill Level Matrix</h3>
            <p className="text-sm text-base-content/70">Showcase verified technical skills categorized by Beginner, Intermediate, Advanced, and Expert proficiency.</p>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-xl p-6 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="text-4xl mb-4">🤝</div>
            <h3 className="text-xl font-bold mb-2">Dual-Consent Matching</h3>
            <p className="text-sm text-base-content/70">No spam messages. 1-on-1 real-time messaging is unlocked only when both developers mutually accept a connection.</p>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-xl p-6 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-bold mb-2">Real-Time Chat & Code</h3>
            <p className="text-sm text-base-content/70">Socket.IO powered instant messaging with live typing indicators, online presence, and code snippet formatting.</p>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-xl p-6 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="text-4xl mb-4">🛠️</div>
            <h3 className="text-xl font-bold mb-2">Project Workspace</h3>
            <p className="text-sm text-base-content/70">Post open hackathon/side projects, recruit team members, manage applications, and build together.</p>
          </div>

          <div className="card bg-base-100 border border-base-300 shadow-xl p-6 rounded-2xl hover:border-primary/50 transition-colors">
            <div className="text-4xl mb-4">👑</div>
            <h3 className="text-xl font-bold mb-2">Admin Safety</h3>
            <p className="text-sm text-base-content/70">Comprehensive admin moderation dashboard, report resolution, and platform health monitoring.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
