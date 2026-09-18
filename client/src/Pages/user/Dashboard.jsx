import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { connectionApi } from "../../services/connectionApi.js";
import { projectApi } from "../../services/projectApi.js";

export const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({ connections: 0, pending: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [connRes, pendRes, projRes] = await Promise.all([
          connectionApi.getConnections().catch(() => ({ connections: [] })),
          connectionApi.getPendingRequests().catch(() => ({ incoming: [] })),
          projectApi.getAllProjects().catch(() => ({ projects: [] })),
        ]);

        setStats({
          connections: connRes.count || connRes.connections?.length || 0,
          pending: pendRes.incomingCount || pendRes.incoming?.length || 0,
          projects: projRes.count || projRes.projects?.length || 0,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="hero bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-3xl p-8 border border-base-300">
        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h1 className="text-3xl font-black text-base-content tracking-tight">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-sm text-base-content/70">
              Discover developers, manage connections, chat in real-time, and collaborate on projects.
            </p>
          </div>
          <Link to="/app/discover" className="btn btn-primary shadow-lg shadow-primary/30 rounded-2xl">
            Start Swiping & Discovering 🔍
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-300">
          <div className="stat-figure text-primary text-3xl">🤝</div>
          <div className="stat-title font-bold text-xs uppercase text-base-content/60">Active Matches</div>
          <div className="stat-value text-primary mt-1">{stats.connections}</div>
          <div className="stat-desc text-xs mt-1">
            <Link to="/app/connections" className="text-primary hover:underline font-semibold">View Matches →</Link>
          </div>
        </div>

        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-300">
          <div className="stat-figure text-secondary text-3xl">📩</div>
          <div className="stat-title font-bold text-xs uppercase text-base-content/60">Pending Requests</div>
          <div className="stat-value text-secondary mt-1">{stats.pending}</div>
          <div className="stat-desc text-xs mt-1">
            <Link to="/app/connections" className="text-secondary hover:underline font-semibold">Review Requests →</Link>
          </div>
        </div>

        <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-300">
          <div className="stat-figure text-accent text-3xl">🛠️</div>
          <div className="stat-title font-bold text-xs uppercase text-base-content/60">Platform Projects</div>
          <div className="stat-value text-accent mt-1">{stats.projects}</div>
          <div className="stat-desc text-xs mt-1">
            <Link to="/app/projects" className="text-accent hover:underline font-semibold">Browse Projects →</Link>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/app/discover" className="card bg-base-100 border border-base-300 p-6 rounded-2xl hover:shadow-lg transition-all hover:border-primary/40">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="font-bold text-base-content">Discover Developers</h3>
          <p className="text-xs text-base-content/60 mt-1">Browse developer cards & filter by tech stack.</p>
        </Link>

        <Link to="/app/messages" className="card bg-base-100 border border-base-300 p-6 rounded-2xl hover:shadow-lg transition-all hover:border-secondary/40">
          <div className="text-3xl mb-2">💬</div>
          <h3 className="font-bold text-base-content">Real-Time Chat</h3>
          <p className="text-xs text-base-content/60 mt-1">Chat 1-on-1 with mutual developer matches.</p>
        </Link>

        <Link to="/app/projects" className="card bg-base-100 border border-base-300 p-6 rounded-2xl hover:shadow-lg transition-all hover:border-accent/40">
          <div className="text-3xl mb-2">🛠️</div>
          <h3 className="font-bold text-base-content">Project Collaboration</h3>
          <p className="text-xs text-base-content/60 mt-1">Create or apply for open side project teams.</p>
        </Link>

        <Link to="/app/profile" className="card bg-base-100 border border-base-300 p-6 rounded-2xl hover:shadow-lg transition-all hover:border-base-content/40">
          <div className="text-3xl mb-2">⚡</div>
          <h3 className="font-bold text-base-content">Skill Matrix</h3>
          <p className="text-xs text-base-content/60 mt-1">Manage your skills & set proficiency levels.</p>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
