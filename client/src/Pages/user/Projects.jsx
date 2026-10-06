import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { projectApi } from "../../services/projectApi.js";
import { useToast } from "../../context/ToastContext.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import Loader from "../../components/Loader/Loader.jsx";
import ProjectDetailsModal from "../../components/ProjectDetailsModal/ProjectDetailsModal.jsx";

export const Projects = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const { success: toastSuccess, error: toastError } = useToast();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all" | "recruiting" | "my_projects" | "joined"

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [techInput, setTechInput] = useState("");
  const [techStackTags, setTechStackTags] = useState(["React", "Node.js", "Tailwind CSS"]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    repoUrl: "",
    liveUrl: "",
    maxMembers: 5,
  });

  // Details Modal State
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await projectApi.getAllProjects();
      if (res.success) {
        setProjects(res.projects || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleAddTechTag = (e) => {
    e.preventDefault();
    const tag = techInput.trim();
    if (tag && !techStackTags.includes(tag)) {
      setTechStackTags([...techStackTags, tag]);
      setTechInput("");
    }
  };

  const handleRemoveTechTag = (tagToRemove) => {
    setTechStackTags(techStackTags.filter((t) => t !== tagToRemove));
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (techStackTags.length === 0) {
      toastError("Please add at least one tech stack tag");
      return;
    }

    try {
      const res = await projectApi.createProject({
        ...formData,
        techStack: techStackTags,
      });

      if (res.success) {
        setIsCreateModalOpen(false);
        setFormData({ title: "", description: "", repoUrl: "", liveUrl: "", maxMembers: 5 });
        setTechStackTags(["React", "Node.js", "Tailwind CSS"]);
        toastSuccess("Project workspace published! 🚀");
        await loadProjects();
      }
    } catch (err) {
      console.error(err);
      toastError(err.message || "Failed to create project");
    }
  };

  const handleJoinProject = async (e, projectId) => {
    e.stopPropagation();
    try {
      const res = await projectApi.joinProject(projectId);
      toastSuccess(res.message || "Application submitted to project owner! ⚡");
      await loadProjects();
    } catch (err) {
      toastError(err.message || "Failed to apply to project");
    }
  };

  const handleOpenDetails = (projectId) => {
    setSelectedProjectId(projectId);
    setIsDetailsModalOpen(true);
  };

  // Filtered projects
  const filteredProjects = projects.filter((proj) => {
    const isOwner = proj.userId === currentUser?.id;
    const isMember = proj.members?.some((m) => m.userId === currentUser?.id && m.status === "ACCEPTED");

    if (activeTab === "recruiting" && proj.status !== "RECRUITING") return false;
    if (activeTab === "my_projects" && !isOwner) return false;
    if (activeTab === "joined" && !isMember) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = proj.title.toLowerCase().includes(q);
      const matchDesc = proj.description.toLowerCase().includes(q);
      const matchTech = proj.techStack?.some((t) => t.toLowerCase().includes(q));
      return matchTitle || matchDesc || matchTech;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Creation CTA */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-base-content tracking-tight">
            🛠️ Project Collaboration Hub
          </h1>
          <p className="text-xs text-base-content/60">
            Post open projects, recruit developer teammates, or join active builds
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary rounded-2xl shadow-lg shadow-primary/20 font-bold gap-2"
        >
          + Post New Project 🚀
        </button>
      </div>

      {/* Navigation Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-base-100 p-2.5 rounded-2xl border border-base-300">
        <div className="tabs tabs-boxed bg-base-200/50 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`tab tab-sm font-semibold ${activeTab === "all" ? "tab-active font-bold" : ""}`}
          >
            All Builds ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab("recruiting")}
            className={`tab tab-sm font-semibold ${activeTab === "recruiting" ? "tab-active font-bold" : ""}`}
          >
            Recruiting ⚡
          </button>
          <button
            onClick={() => setActiveTab("my_projects")}
            className={`tab tab-sm font-semibold ${activeTab === "my_projects" ? "tab-active font-bold" : ""}`}
          >
            My Projects 👑
          </button>
          <button
            onClick={() => setActiveTab("joined")}
            className={`tab tab-sm font-semibold ${activeTab === "joined" ? "tab-active font-bold" : ""}`}
          >
            Team Member 💻
          </button>
        </div>

        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Search by title, stack..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm input-bordered rounded-xl w-full text-xs focus:outline-primary"
          />
        </div>
      </div>

      {/* Projects Grid List */}
      {loading ? (
        <Loader text="Loading project listings..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((proj) => {
            const isOwner = proj.userId === currentUser?.id;
            const memberRecord = proj.members?.find((m) => m.userId === currentUser?.id);
            const isAcceptedMember = memberRecord?.status === "ACCEPTED";
            const isPendingApplicant = memberRecord?.status === "PENDING";
            const memberCount = proj.members?.length || 1;
            const isFull = memberCount >= proj.maxMembers;

            return (
              <div
                key={proj.id}
                onClick={() => handleOpenDetails(proj.id)}
                className="card bg-base-100 border border-base-300 shadow-xl rounded-3xl p-6 space-y-4 hover:border-primary/50 hover:shadow-2xl transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-black text-lg text-base-content group-hover:text-primary transition-colors">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-base-content/60 mt-0.5">
                        By <span className="font-semibold text-primary">{proj.user?.firstName} {proj.user?.lastName}</span>
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`badge text-[10px] font-extrabold uppercase ${
                          proj.status === "RECRUITING"
                            ? "badge-success"
                            : proj.status === "IN_PROGRESS"
                            ? "badge-primary"
                            : "badge-ghost"
                        }`}
                      >
                        {proj.status}
                      </span>
                      {isOwner && (
                        <span className="badge badge-warning badge-xs font-bold">👑 Owner</span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-base-content/80 line-clamp-3 leading-relaxed">
                    {proj.description}
                  </p>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 mb-1.5">
                      Tech Stack
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {proj.techStack?.map((t, i) => (
                        <span key={i} className="badge badge-neutral badge-sm text-[11px] font-mono">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-base-200 text-xs">
                  <span className="font-medium text-base-content/70 flex items-center gap-1">
                    👥 Team: <strong className="text-base-content">{memberCount} / {proj.maxMembers}</strong>
                  </span>

                  {isOwner ? (
                    <span className="btn btn-xs btn-outline btn-primary rounded-xl font-bold">
                      Manage Project ⚙️
                    </span>
                  ) : isAcceptedMember ? (
                    <span className="badge badge-success text-xs font-bold py-2">
                      ✓ Team Member
                    </span>
                  ) : isPendingApplicant ? (
                    <span className="badge badge-warning text-xs font-bold py-2">
                      ⏳ Pending Approval
                    </span>
                  ) : proj.status === "RECRUITING" && !isFull ? (
                    <button
                      onClick={(e) => handleJoinProject(e, proj.id)}
                      className="btn btn-xs btn-primary rounded-xl font-bold px-3"
                    >
                      Apply ⚡
                    </button>
                  ) : (
                    <span className="badge badge-ghost text-xs">Team Full</span>
                  )}
                </div>
              </div>
            );
          })}

          {filteredProjects.length === 0 && (
            <div className="col-span-2 card bg-base-100 p-12 text-center rounded-3xl border border-base-300 space-y-3">
              <span className="text-5xl">🛠️</span>
              <h3 className="text-base font-bold text-base-content">No project builds found</h3>
              <p className="text-xs text-base-content/60 max-w-md mx-auto">
                {searchQuery
                  ? "No projects match your current search query. Try clearing your filters!"
                  : "Be the first developer to post a new project idea and recruit co-builders!"}
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="btn btn-sm btn-primary rounded-xl max-w-xs mx-auto font-bold"
              >
                + Create Project 🚀
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="🚀 Post a New Project"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-xs">Project Title *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. AI-Powered Code Reviewer"
              required
              className="input input-bordered rounded-xl w-full text-sm focus:outline-primary"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-xs">Project Description *</span>
            </label>
            <textarea
              placeholder="Describe your project vision, key features, and what teammate skills you are looking for..."
              required
              className="textarea textarea-bordered rounded-xl w-full text-sm h-28 focus:outline-primary"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Interactive Tech Stack Tag Builder */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold text-xs">Required Tech Stack Tags *</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Type tech (e.g. React, Docker, Python) & press Add"
                className="input input-bordered input-sm rounded-xl flex-1 text-xs focus:outline-primary"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddTechTag(e);
                  }
                }}
              />
              <button
                type="button"
                onClick={handleAddTechTag}
                className="btn btn-sm btn-secondary rounded-xl text-xs font-bold"
              >
                + Add Tag
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 bg-base-200/40 rounded-xl border border-base-300">
              {techStackTags.map((tag) => (
                <span
                  key={tag}
                  className="badge badge-primary badge-md gap-1 font-mono text-xs cursor-pointer"
                  onClick={() => handleRemoveTechTag(tag)}
                  title="Click to remove"
                >
                  {tag} <span className="font-bold">✕</span>
                </span>
              ))}
              {techStackTags.length === 0 && (
                <span className="text-xs text-base-content/40 italic">No tags added yet</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-xs">GitHub Repo URL</span>
              </label>
              <input
                type="url"
                placeholder="https://github.com/..."
                className="input input-bordered rounded-xl w-full text-xs focus:outline-primary"
                value={formData.repoUrl}
                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-xs">Live Preview URL</span>
              </label>
              <input
                type="url"
                placeholder="https://myproject.vercel.app"
                className="input input-bordered rounded-xl w-full text-xs focus:outline-primary"
                value={formData.liveUrl}
                onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-bold text-xs">Max Members</span>
              </label>
              <input
                type="number"
                min={2}
                max={12}
                className="input input-bordered rounded-xl w-full text-xs focus:outline-primary"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-3 border-t border-base-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn btn-sm btn-ghost rounded-xl text-xs"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-sm btn-primary rounded-xl font-bold px-6">
              Publish Project 🚀
            </button>
          </div>
        </form>
      </Modal>

      {/* Project Details & Management Modal */}
      <ProjectDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        projectId={selectedProjectId}
        onProjectUpdated={loadProjects}
      />
    </div>
  );
};

export default Projects;

