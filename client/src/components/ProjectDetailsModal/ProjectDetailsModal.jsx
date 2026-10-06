import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { projectApi } from "../../services/projectApi.js";
import { useToast } from "../../context/ToastContext.jsx";
import Modal from "../Modal/Modal.jsx";
import Loader from "../Loader/Loader.jsx";
import { getAvatarUrl } from "../../utils/avatar.js";

export const ProjectDetailsModal = ({ isOpen, onClose, projectId, onProjectUpdated }) => {
  const currentUser = useSelector((state) => state.auth.user);
  const { success: toastSuccess, error: toastError } = useToast();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProjectDetails = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const res = await projectApi.getProjectById(projectId);
      if (res.success) {
        setProject(res.project);
      }
    } catch (err) {
      console.error(err);
      toastError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && projectId) {
      loadProjectDetails();
    }
  }, [isOpen, projectId]);

  if (!isOpen) return null;

  const isOwner = project?.userId === currentUser?.id;
  const userMembership = project?.members?.find((m) => m.userId === currentUser?.id);
  const acceptedMembers = project?.members?.filter((m) => m.status === "ACCEPTED") || [];
  const pendingApplicants = project?.members?.filter((m) => m.status === "PENDING") || [];

  const handleReviewRequest = async (memberId, action) => {
    try {
      setActionLoading(true);
      const res = await projectApi.reviewJoinRequest(projectId, memberId, action);
      toastSuccess(res.message || `Applicant ${action === "ACCEPT" ? "approved" : "rejected"}`);
      await loadProjectDetails();
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      console.error(err);
      toastError(err.message || "Failed to review request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setActionLoading(true);
      const res = await projectApi.manageProject(projectId, { status: newStatus });
      toastSuccess(`Project status updated to ${newStatus}`);
      await loadProjectDetails();
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      console.error(err);
      toastError(err.message || "Failed to update project status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApplyToJoin = async () => {
    try {
      setActionLoading(true);
      const res = await projectApi.joinProject(projectId);
      toastSuccess(res.message || "Application submitted!");
      await loadProjectDetails();
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      console.error(err);
      toastError(err.message || "Failed to submit application");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveProject = async () => {
    try {
      setActionLoading(true);
      await projectApi.leaveProject(projectId);
      toastSuccess("You left the project workspace");
      onClose();
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      console.error(err);
      toastError(err.message || "Failed to leave project");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
      setActionLoading(true);
      await projectApi.deleteProject(projectId);
      toastSuccess("Project deleted successfully");
      onClose();
      if (onProjectUpdated) onProjectUpdated();
    } catch (err) {
      console.error(err);
      toastError(err.message || "Failed to delete project");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      {loading || !project ? (
        <div className="py-12">
          <Loader text="Loading project details..." />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header & Status Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-base-200 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-base-content">{project.title}</h2>
                <span
                  className={`badge text-xs font-bold uppercase ${
                    project.status === "RECRUITING"
                      ? "badge-success"
                      : project.status === "IN_PROGRESS"
                      ? "badge-primary"
                      : "badge-ghost"
                  }`}
                >
                  {project.status}
                </span>
              </div>
              <p className="text-xs text-base-content/60 mt-1 flex items-center gap-2">
                <span>Posted by {project.user?.firstName} {project.user?.lastName}</span>
                <span>•</span>
                <span>Team: {acceptedMembers.length} / {project.maxMembers}</span>
              </p>
            </div>

            {/* Owner Status Switcher Dropdown */}
            {isOwner && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-base-content/60">Status:</span>
                <select
                  value={project.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={actionLoading}
                  className="select select-sm select-bordered rounded-xl text-xs font-semibold"
                >
                  <option value="RECRUITING">RECRUITING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            )}
          </div>

          {/* Description & Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50">Overview</h4>
            <p className="text-sm text-base-content/90 leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>

            {/* Links */}
            <div className="flex flex-wrap gap-3 pt-2">
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-xs btn-outline rounded-lg gap-1.5"
                >
                  🐙 GitHub Repository ↗
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-xs btn-secondary rounded-lg gap-1.5"
                >
                  🌐 Live Preview ↗
                </a>
              )}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">Tech Stack</h4>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack?.map((tag, idx) => (
                <span key={idx} className="badge badge-neutral badge-md text-xs font-mono">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Team Roster Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
              Team Roster ({acceptedMembers.length} / {project.maxMembers})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {acceptedMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-base-200/50 border border-base-300"
                >
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img
                        src={getAvatarUrl(
                          member.user?.avatarUrl,
                          `${member.user?.firstName} ${member.user?.lastName}`
                        )}
                        alt={member.user?.firstName}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-xs truncate">
                      {member.user?.firstName} {member.user?.lastName}
                    </p>
                    <p className="text-[10px] text-base-content/60 truncate">
                      {member.role === "OWNER" ? "👑 Project Creator" : "💻 Contributor"}
                    </p>
                  </div>
                  <span
                    className={`badge badge-xs ${
                      member.role === "OWNER" ? "badge-primary" : "badge-ghost"
                    }`}
                  >
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Owner Review Section for Pending Applicants */}
          {isOwner && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  📥 Pending Join Applicants ({pendingApplicants.length})
                </h4>
              </div>

              <div className="space-y-2">
                {pendingApplicants.map((applicant) => (
                  <div
                    key={applicant.id}
                    className="flex items-center justify-between gap-3 p-3 bg-base-100 rounded-xl border border-base-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="w-9 rounded-full ring-1 ring-primary">
                          <img
                            src={getAvatarUrl(
                              applicant.user?.avatarUrl,
                              `${applicant.user?.firstName} ${applicant.user?.lastName}`
                            )}
                            alt="Applicant"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-xs">
                          {applicant.user?.firstName} {applicant.user?.lastName}
                        </p>
                        {applicant.user?.headline && (
                          <p className="text-[10px] text-base-content/60">{applicant.user.headline}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleReviewRequest(applicant.id, "ACCEPT")}
                        disabled={actionLoading}
                        className="btn btn-xs btn-success rounded-lg font-bold"
                      >
                        Accept ✓
                      </button>
                      <button
                        onClick={() => handleReviewRequest(applicant.id, "REJECT")}
                        disabled={actionLoading}
                        className="btn btn-xs btn-outline btn-error rounded-lg font-bold"
                      >
                        Reject ✕
                      </button>
                    </div>
                  </div>
                ))}

                {pendingApplicants.length === 0 && (
                  <p className="text-xs text-base-content/50 italic text-center py-2">
                    No pending join requests at the moment.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* User Status / Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-base-200">
            {isOwner ? (
              <button
                onClick={handleDeleteProject}
                disabled={actionLoading}
                className="btn btn-sm btn-outline btn-error rounded-xl font-bold"
              >
                🗑️ Delete Project
              </button>
            ) : userMembership?.status === "ACCEPTED" ? (
              <button
                onClick={handleLeaveProject}
                disabled={actionLoading}
                className="btn btn-sm btn-outline btn-error rounded-xl font-bold"
              >
                🚪 Leave Team
              </button>
            ) : userMembership?.status === "PENDING" ? (
              <span className="badge badge-warning badge-lg text-xs font-bold">
                ⏳ Application Pending Owner Review
              </span>
            ) : project.status === "RECRUITING" && acceptedMembers.length < project.maxMembers ? (
              <button
                onClick={handleApplyToJoin}
                disabled={actionLoading}
                className="btn btn-primary btn-sm rounded-xl font-bold px-6"
              >
                {actionLoading ? <span className="loading loading-spinner loading-xs" /> : "Apply to Join ⚡"}
              </button>
            ) : (
              <span className="badge badge-ghost badge-lg text-xs font-bold">
                Team Full / Not Recruiting
              </span>
            )}

            <button onClick={onClose} className="btn btn-sm btn-ghost rounded-xl text-xs ml-auto">
              Close Window
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ProjectDetailsModal;
