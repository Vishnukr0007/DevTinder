import React, { useState, useEffect } from "react";
import { projectApi } from "../../services/projectApi.js";
import SkillBadge from "../../components/SkillBadge/SkillBadge.jsx";
import Button from "../../components/Button/Button.jsx";
import Modal from "../../components/Modal/Modal.jsx";
import Loader from "../../components/Loader/Loader.jsx";

export const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    techStackStr: "",
    repoUrl: "",
    liveUrl: "",
    maxMembers: 5,
  });

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

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const techStack = formData.techStackStr.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await projectApi.createProject({ ...formData, techStack });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ title: "", description: "", techStackStr: "", repoUrl: "", liveUrl: "", maxMembers: 5 });
        await loadProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinProject = async (projectId) => {
    try {
      const res = await projectApi.joinProject(projectId);
      alert(res.message);
      await loadProjects();
    } catch (err) {
      alert(err.message || "Failed to join project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-base-content">🛠️ Project Collaboration Workspace</h1>
          <p className="text-xs text-base-content/60">Post projects, recruit developer teammates, or join open builds</p>
        </div>

        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary rounded-xl">
          + Create Project 🚀
        </button>
      </div>

      {/* Projects List */}
      {loading ? (
        <Loader text="Loading projects..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((proj) => (
            <div key={proj.id} className="card bg-base-100 border border-base-300 shadow-xl rounded-3xl p-6 space-y-4 hover:border-primary/40 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-lg text-base-content">{proj.title}</h3>
                  <p className="text-xs text-primary font-semibold mt-0.5">By {proj.user?.firstName} {proj.user?.lastName}</p>
                </div>
                <span className="badge badge-accent badge-soft text-xs uppercase font-bold">{proj.status}</span>
              </div>

              <p className="text-xs text-base-content/80 line-clamp-3 leading-relaxed">{proj.description}</p>

              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-base-content/50 mb-1">Required Tech Stack</h4>
                <div className="flex flex-wrap gap-1">
                  {proj.techStack?.map((t, i) => (
                    <span key={i} className="badge badge-ghost text-xs font-mono">{t}</span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-base-200 text-xs">
                <span className="text-base-content/60">👥 Team: {proj.members?.length || 1} / {proj.maxMembers}</span>
                <button onClick={() => handleJoinProject(proj.id)} className="btn btn-sm btn-primary rounded-xl">
                  Apply to Join
                </button>
              </div>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="col-span-2 card bg-base-100 p-8 text-center rounded-3xl border border-base-300">
              <span className="text-4xl mb-2">🛠️</span>
              <p className="text-sm font-bold">No active project listings found.</p>
              <p className="text-xs text-base-content/60 mt-1">Be the first developer to post a new side project!</p>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="🚀 Post a New Project">
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text font-bold">Project Title</span></label>
            <input
              type="text"
              placeholder="DevTinder Mobile App"
              required
              className="input input-bordered rounded-xl w-full text-sm"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-bold">Project Description</span></label>
            <textarea
              placeholder="Describe your project, goals, and what roles you need..."
              required
              className="textarea textarea-bordered rounded-xl w-full text-sm h-24"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-bold">Tech Stack (comma separated)</span></label>
            <input
              type="text"
              placeholder="React, Node.js, PostgreSQL, Docker"
              required
              className="input input-bordered rounded-xl w-full text-sm"
              value={formData.techStackStr}
              onChange={(e) => setFormData({ ...formData, techStackStr: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label"><span className="label-text font-bold">GitHub Repo URL</span></label>
              <input
                type="url"
                placeholder="https://github.com/..."
                className="input input-bordered rounded-xl w-full text-sm"
                value={formData.repoUrl}
                onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              />
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-bold">Max Members</span></label>
              <input
                type="number"
                min={2}
                max={10}
                className="input input-bordered rounded-xl w-full text-sm"
                value={formData.maxMembers}
                onChange={(e) => setFormData({ ...formData, maxMembers: e.target.value })}
              />
            </div>
          </div>

          <Button type="submit" className="w-full btn-primary rounded-xl mt-4">
            Publish Project 🚀
          </Button>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;
