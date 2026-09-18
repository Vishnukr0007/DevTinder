import React, { useState, useEffect } from "react";
import Loader from "../../components/Loader/Loader.jsx";
import { fetchApi } from "../../services/api.js";

export const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    try {
      setLoading(true);
      const res = await fetchApi("/admin/reports");
      if (res.success) {
        setReports(res.reports || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleResolve = async (reportId, status) => {
    try {
      await fetchApi(`/admin/reports/${reportId}/resolve`, { method: "POST", body: { status } });
      await loadReports();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-base-content">🚩 Moderation & User Reports Queue</h1>
        <p className="text-xs text-base-content/60">Audit reported accounts and content violations</p>
      </div>

      {loading ? (
        <Loader text="Loading reports queue..." />
      ) : (
        <div className="space-y-4">
          {reports.map((rep) => (
            <div key={rep.id} className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge badge-error text-xs font-bold">{rep.reason}</span>
                  <span className="text-xs text-base-content/60">By {rep.reporter?.email}</span>
                </div>
                <p className="text-sm font-bold text-base-content">Target User: {rep.targetUser?.email || "Unknown"}</p>
                {rep.details && <p className="text-xs text-base-content/70">{rep.details}</p>}
              </div>

              <div className="flex gap-2">
                <button onClick={() => handleResolve(rep.id, "RESOLVED")} className="btn btn-xs btn-success rounded-lg">
                  Resolve
                </button>
                <button onClick={() => handleResolve(rep.id, "DISMISSED")} className="btn btn-xs btn-outline rounded-lg">
                  Dismiss
                </button>
              </div>
            </div>
          ))}

          {reports.length === 0 && (
            <div className="text-center py-12 text-xs text-base-content/50">
              No pending reports in the moderation queue. 🎉
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminReports;
