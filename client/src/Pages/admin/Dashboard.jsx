import React, { useState, useEffect } from "react";
import Loader from "../../components/Loader/Loader.jsx";
import { fetchApi } from "../../services/api.js";

export const AdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await fetchApi("/admin/dashboard");
        if (data.success) {
          setMetrics(data.metrics);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) return <Loader text="Loading Admin Statistics..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-base-content">📊 Admin Dashboard Statistics</h1>
        <p className="text-xs text-base-content/60">Live metrics & platform health overview</p>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="stat bg-base-200/60 border border-base-300 rounded-2xl">
            <div className="stat-title text-xs font-bold uppercase text-primary">Total Registered Users</div>
            <div className="stat-value text-primary">{metrics.users?.total || 0}</div>
            <div className="stat-desc text-[11px] mt-1">{metrics.users?.developers || 0} Developers</div>
          </div>

          <div className="stat bg-base-200/60 border border-base-300 rounded-2xl">
            <div className="stat-title text-xs font-bold uppercase text-secondary">Total Mutual Matches</div>
            <div className="stat-value text-secondary">{metrics.connections?.totalMatches || 0}</div>
            <div className="stat-desc text-[11px] mt-1">{metrics.connections?.pendingRequests || 0} Pending</div>
          </div>

          <div className="stat bg-base-200/60 border border-base-300 rounded-2xl">
            <div className="stat-title text-xs font-bold uppercase text-accent">Total Chat Messages</div>
            <div className="stat-value text-accent">{metrics.messaging?.totalMessages || 0}</div>
            <div className="stat-desc text-[11px] mt-1">Live WebSockets</div>
          </div>

          <div className="stat bg-base-200/60 border border-base-300 rounded-2xl">
            <div className="stat-title text-xs font-bold uppercase text-warning">Active Projects</div>
            <div className="stat-value text-warning">{metrics.projects?.recruiting || 0}</div>
            <div className="stat-desc text-[11px] mt-1">{metrics.projects?.total || 0} Total Projects</div>
          </div>
        </div>
      )}

      <div className="alert alert-success text-xs font-bold rounded-2xl">
        <span>⚡ System Health: {metrics?.systemStatus || "Healthy"}</span>
      </div>
    </div>
  );
};

export default AdminDashboard;
