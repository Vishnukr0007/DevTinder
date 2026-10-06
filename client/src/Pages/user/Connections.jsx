import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { connectionApi } from "../../services/connectionApi.js";
import { useToast } from "../../context/ToastContext.jsx";
import SkillBadge from "../../components/SkillBadge/SkillBadge.jsx";
import Loader from "../../components/Loader/Loader.jsx";

export const Connections = () => {
  const { success: toastSuccess, error: toastError } = useToast();

  const [tab, setTab] = useState("matches"); // "matches" | "pending" | "saved"
  const [connections, setConnections] = useState([]);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [savedDevelopers, setSavedDevelopers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [connRes, pendRes, savedRes] = await Promise.all([
        connectionApi.getConnections().catch(() => ({ connections: [] })),
        connectionApi.getPendingRequests().catch(() => ({ incoming: [], outgoing: [] })),
        connectionApi.getSavedDevelopers().catch(() => ({ savedDevelopers: [] })),
      ]);

      setConnections(connRes.connections || []);
      setIncoming(pendRes.incoming || []);
      setOutgoing(pendRes.outgoing || []);
      setSavedDevelopers(savedRes.savedDevelopers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAccept = async (requestId) => {
    try {
      await connectionApi.acceptRequest(requestId);
      toastSuccess("Connection accepted!");
      await loadData();
    } catch (err) {
      console.error(err);
      toastError("Failed to accept connection");
    }
  };

  const handleReject = async (requestId) => {
    try {
      await connectionApi.rejectRequest(requestId);
      toastSuccess("Request rejected.");
      await loadData();
    } catch (err) {
      console.error(err);
      toastError("Failed to reject request");
    }
  };

  const handleRemove = async (targetUserId) => {
    try {
      await connectionApi.removeConnection(targetUserId);
      toastSuccess("Connection removed");
      await loadData();
    } catch (err) {
      console.error(err);
      toastError("Failed to remove connection");
    }
  };

  const handleUnsave = async (developerId) => {
    try {
      await connectionApi.unsaveDeveloper(developerId);
      toastSuccess("Removed from saved bookmarks");
      setSavedDevelopers((prev) => prev.filter((d) => d.id !== developerId));
    } catch (err) {
      console.error(err);
      toastError("Failed to remove bookmark");
    }
  };

  const handleConnectSaved = async (developerId) => {
    try {
      const res = await connectionApi.connectDeveloper(developerId);
      toastSuccess(res.message || "Connection request sent!");
      await loadData();
    } catch (err) {
      console.error(err);
      toastError("Failed to send request");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-base-content">🤝 Connections & Matches</h1>
          <p className="text-xs text-base-content/60">Manage connected developers, invitations, and saved bookmarks</p>
        </div>

        {/* Tab switcher */}
        <div className="tabs tabs-boxed bg-base-100 p-1 border border-base-300 rounded-xl">
          <button
            onClick={() => setTab("matches")}
            className={`tab ${tab === "matches" ? "tab-active font-bold" : ""}`}
          >
            Matches ({connections.length})
          </button>
          <button
            onClick={() => setTab("pending")}
            className={`tab ${tab === "pending" ? "tab-active font-bold" : ""}`}
          >
            Pending ({incoming.length})
          </button>
          <button
            onClick={() => setTab("saved")}
            className={`tab ${tab === "saved" ? "tab-active font-bold" : ""}`}
          >
            Saved ⭐ ({savedDevelopers.length})
          </button>
        </div>
      </div>

      {loading ? (
        <Loader text="Loading developers..." />
      ) : tab === "matches" ? (
        /* Active Connections List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.map(({ connectionId, user }) => (
            <div key={connectionId} className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-14 rounded-full ring-2 ring-primary">
                    <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.firstName} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-base text-base-content">{user.firstName} {user.lastName}</h3>
                  <p className="text-xs text-primary font-medium">{user.headline || "Software Developer"}</p>
                  <p className="text-[11px] text-base-content/60">{user.location || "Remote"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {user.userSkills?.slice(0, 4).map((s, i) => (
                  <SkillBadge key={i} name={s.name} level={s.level} />
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-base-200">
                <Link to="/app/messages" className="btn btn-sm btn-primary rounded-xl flex-1 font-bold">
                  💬 Start Chat
                </Link>
                <button onClick={() => handleRemove(user.id)} className="btn btn-sm btn-ghost btn-square text-error" title="Remove Connection">
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {connections.length === 0 && (
            <div className="col-span-2 card bg-base-100 p-8 text-center rounded-2xl border border-base-300">
              <span className="text-4xl mb-2">🤝</span>
              <p className="text-sm font-bold">No active matches yet.</p>
              <p className="text-xs text-base-content/60 mt-1">Start swiping in Developer Discovery to match!</p>
              <Link to="/app/discover" className="btn btn-sm btn-primary rounded-xl mt-4 max-w-xs mx-auto">
                Go to Discovery 🔍
              </Link>
            </div>
          )}
        </div>
      ) : tab === "pending" ? (
        /* Pending Requests List */
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/60">Incoming Requests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {incoming.map(({ requestId, user }) => (
              <div key={requestId} className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm space-y-3">
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-12 rounded-full ring-2 ring-secondary">
                      <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.firstName} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-base-content">{user.firstName} {user.lastName}</h3>
                    <p className="text-xs text-base-content/70">{user.headline}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleAccept(requestId)} className="btn btn-sm btn-success rounded-xl flex-1 font-bold">
                    ✓ Accept
                  </button>
                  <button onClick={() => handleReject(requestId)} className="btn btn-sm btn-outline btn-error rounded-xl flex-1 font-bold">
                    ✕ Reject
                  </button>
                </div>
              </div>
            ))}

            {incoming.length === 0 && (
              <div className="col-span-2 text-center py-6 text-xs text-base-content/50">
                No incoming pending connection requests.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Saved Developers Bookmarks List */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedDevelopers.map((user) => (
            <div key={user.id} className="card bg-base-100 border border-base-300 p-5 rounded-2xl shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="avatar">
                  <div className="w-12 rounded-full ring-2 ring-warning">
                    <img src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt={user.firstName} />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-base-content">{user.firstName} {user.lastName}</h3>
                  <p className="text-xs text-primary font-medium">{user.headline || "Software Developer"}</p>
                  <p className="text-[11px] text-base-content/60">{user.location || "Remote"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {user.userSkills?.slice(0, 4).map((s, i) => (
                  <SkillBadge key={i} name={s.name} level={s.level} />
                ))}
              </div>

              <div className="flex gap-2 pt-2 border-t border-base-200">
                <button onClick={() => handleConnectSaved(user.id)} className="btn btn-sm btn-primary rounded-xl flex-1 font-bold">
                  ⚡ Send Request
                </button>
                <button onClick={() => handleUnsave(user.id)} className="btn btn-sm btn-ghost btn-square text-error" title="Remove Bookmark">
                  ⭐✕
                </button>
              </div>
            </div>
          ))}

          {savedDevelopers.length === 0 && (
            <div className="col-span-2 card bg-base-100 p-8 text-center rounded-2xl border border-base-300">
              <span className="text-4xl mb-2">⭐</span>
              <p className="text-sm font-bold">No saved developer bookmarks.</p>
              <p className="text-xs text-base-content/60 mt-1">Bookmark profiles while browsing discovery to review later!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Connections;

