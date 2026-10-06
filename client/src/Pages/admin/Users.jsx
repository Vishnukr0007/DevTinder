import React, { useState, useEffect } from "react";
import Loader from "../../components/Loader/Loader.jsx";
import { fetchApi } from "../../services/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export const AdminUsers = () => {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const query = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetchApi(`/admin/users${query}`);
      if (res.success) {
        setUsers(res.users || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await fetchApi(`/admin/users/${userId}/role`, { method: "PUT", body: { role } });
      if (res.success) {
        setFeedback(`Role updated to ${role}`);
        await loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSuspend = async (userId, isSuspended) => {
    try {
      const res = await fetchApi(`/admin/users/${userId}/suspend`, { method: "POST", body: { isSuspended: !isSuspended } });
      if (res.success) {
        success(res.message || "User suspension status updated");
        await loadUsers();
      }
    } catch (err) {
      error(err.message || "Failed to toggle suspension");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user account?")) return;
    try {
      const res = await fetchApi(`/admin/users/${userId}`, { method: "DELETE" });
      if (res.success) {
        success("User account deleted successfully");
        await loadUsers();
      }
    } catch (err) {
      console.error(err);
      error(err.message || "Failed to delete user");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-base-content">👥 User Management</h1>
          <p className="text-xs text-base-content/60">Search developers, manage roles, suspend or delete accounts</p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search email/name..."
            className="input input-bordered input-sm rounded-xl"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={loadUsers} className="btn btn-sm btn-primary rounded-xl">Filter</button>
        </div>
      </div>

      {feedback && (
        <div className="alert alert-info text-xs font-bold rounded-xl">
          <span>ℹ️ {feedback}</span>
        </div>
      )}

      {loading ? (
        <Loader text="Loading user directory..." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-base-200">
          <table className="table table-zebra w-full text-xs">
            <thead>
              <tr className="bg-base-200/80 text-base-content/70">
                <th>Developer</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="hover">
                  <td className="font-bold text-base-content">{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="select select-bordered select-xs rounded-lg font-bold"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="MODERATOR">MODERATOR</option>
                    </select>
                  </td>
                  <td>
                    {u.isSuspended ? (
                      <span className="badge badge-error badge-xs font-bold">SUSPENDED</span>
                    ) : (
                      <span className="badge badge-success badge-xs font-bold">ACTIVE</span>
                    )}
                  </td>
                  <td className="text-right gap-1 space-x-1">
                    <button
                      onClick={() => handleToggleSuspend(u.id, u.isSuspended)}
                      className={`btn btn-xs rounded-lg ${u.isSuspended ? "btn-success" : "btn-warning"}`}
                    >
                      {u.isSuspended ? "Unsuspend" : "Suspend"}
                    </button>
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="btn btn-xs btn-error rounded-lg"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
