import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateUserProfileThunk, fetchCurrentUser } from "../../store/authSlice.js";
import { userApi } from "../../services/userApi.js";
import SkillBadge from "../../components/SkillBadge/SkillBadge.jsx";
import Button from "../../components/Button/Button.jsx";
import { getAvatarUrl } from "../../utils/avatar.js";

export const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [activeTab, setActiveTab] = useState("general"); // "general" | "skills" | "social"
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [toast, setToast] = useState(null);

  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File is too large. Max allowed size is 5MB.", "error");
      return;
    }

    try {
      setUploadingAvatar(true);
      const res = await userApi.uploadAvatar(file);
      if (res.success && res.avatarUrl) {
        setFormData((prev) => ({ ...prev, avatarUrl: res.avatarUrl }));
        showToast("Avatar uploaded to storage successfully! 📸", "success");
        dispatch(fetchCurrentUser());
      } else {
        showToast(res.message || "Failed to upload avatar.", "error");
      }
    } catch (err) {
      showToast(err.message || "Error uploading image to storage.", "error");
    } finally {
      setUploadingAvatar(false);
      e.target.value = "";
    }
  };

  // Form State
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    headline: user?.headline || "",
    bio: user?.bio || "",
    avatarUrl: user?.avatarUrl || "",
    location: user?.location || "",
    experienceLevel: user?.experienceLevel || "BEGINNER",
    githubUrl: user?.githubUrl || "",
    linkedinUrl: user?.linkedinUrl || "",
    isOpenToPairing: user?.isOpenToPairing ?? true,
  });

  // Skills State
  const [skills, setSkills] = useState([]);
  const [loadingSkills, setLoadingSkills] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("BEGINNER");

  // Keep form data in sync with user state
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        headline: user.headline || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
        location: user.location || "",
        experienceLevel: user.experienceLevel || "BEGINNER",
        githubUrl: user.githubUrl || "",
        linkedinUrl: user.linkedinUrl || "",
        isOpenToPairing: user.isOpenToPairing ?? true,
      });
    }
  }, [user]);

  const loadSkills = async () => {
    try {
      setLoadingSkills(true);
      const res = await userApi.getSkills();
      if (res.success) {
        setSkills(res.skills || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSkills(false);
    }
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const resultAction = await dispatch(updateUserProfileThunk(formData));
      if (updateUserProfileThunk.fulfilled.match(resultAction)) {
        showToast("Profile updated successfully! ✨", "success");
      } else {
        showToast(resultAction.payload || "Failed to update profile.", "error");
      }
    } catch (err) {
      showToast(err.message || "An error occurred.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    try {
      const res = await userApi.addSkill({ name: newSkillName.trim(), level: newSkillLevel });
      if (res.success) {
        showToast(`Skill '${newSkillName}' added!`, "success");
        setNewSkillName("");
        await loadSkills();
        dispatch(fetchCurrentUser());
      }
    } catch (err) {
      showToast(err.message || "Failed to add skill.", "error");
    }
  };

  const handleSetSkillLevel = async (name, level) => {
    try {
      const res = await userApi.setSkillLevel(name, level);
      if (res.success) {
        showToast(`Updated ${name} to ${level}`, "success");
        await loadSkills();
        dispatch(fetchCurrentUser());
      }
    } catch (err) {
      showToast("Failed to update skill level.", "error");
    }
  };

  const handleRemoveSkill = async (name) => {
    try {
      const res = await userApi.removeSkill(name);
      if (res.success) {
        showToast(`Removed skill ${name}`, "info");
        await loadSkills();
        dispatch(fetchCurrentUser());
      }
    } catch (err) {
      showToast("Failed to remove skill.", "error");
    }
  };

  const setAvatarPreset = (seedStyle) => {
    const seed = encodeURIComponent(formData.email || formData.firstName || "dev");
    const avatar = `https://api.dicebear.com/7.x/${seedStyle}/svg?seed=${seed}`;
    setFormData((prev) => ({ ...prev, avatarUrl: avatar }));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`alert ${
              toast.type === "success"
                ? "alert-success text-success-content"
                : toast.type === "error"
                ? "alert-error text-error-content"
                : "alert-info text-info-content"
            } shadow-2xl font-bold rounded-2xl border border-base-content/10 px-6 py-4 flex items-center gap-3`}
          >
            <span>{toast.type === "success" ? "🚀" : toast.type === "error" ? "⚠️" : "ℹ️"}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-base-100 p-6 sm:p-8 rounded-3xl border border-base-300 shadow-sm">
        <div>
          <span className="badge badge-primary badge-outline text-xs uppercase font-mono font-bold tracking-wider mb-2">
            ⚡ Developer Workstation
          </span>
          <h1 className="text-3xl font-black text-base-content tracking-tight">Profile & Preferences</h1>
          <p className="text-xs text-base-content/60 mt-1">
            Update your public profile, technical skill matrix, and pair programming status in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSaveProfile}
            loading={saving}
            className="btn-primary rounded-xl px-6 shadow-md shadow-primary/20"
          >
            Save All Changes 💾
          </Button>
        </div>
      </div>

      {/* Split View Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Real-Time Live Developer Card Preview */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          <div className="text-xs font-bold text-base-content/60 uppercase tracking-wider px-1">
            👁️ Live Profile Preview
          </div>

          <div className="card bg-base-100 shadow-2xl border border-base-300 rounded-3xl overflow-hidden hover:border-primary/50 transition-all">
            {/* Header Cover Banner */}
            <div className="h-28 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 relative">
              {formData.isOpenToPairing ? (
                <span className="absolute top-4 right-4 badge badge-success text-xs font-bold gap-1 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-success-content animate-ping"></span>
                  Open for Pairing
                </span>
              ) : (
                <span className="absolute top-4 right-4 badge badge-ghost text-xs font-medium opacity-70">
                  Not Pairing
                </span>
              )}
            </div>

            {/* Avatar & Main Details */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex justify-between items-end -mt-12 mb-4">
                <div className="avatar">
                  <div className="w-24 h-24 rounded-full ring-4 ring-base-100 shadow-xl bg-base-200 overflow-hidden">
                    <img
                      src={getAvatarUrl(formData.avatarUrl, user?.email || "dev")}
                      alt="Live Preview Avatar"
                      onError={(e) => {
                        e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
                          formData.email || "dev"
                        )}`;
                      }}
                    />
                  </div>
                </div>
                <span className="badge badge-outline border-base-300 text-xs font-bold uppercase">
                  {formData.experienceLevel}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-base-content">
                    {formData.firstName || "First"} {formData.lastName || "Last"}
                  </h2>
                  {user?.isEmailVerified && (
                    <span className="text-primary text-sm" title="Verified Account">
                      ✓
                    </span>
                  )}
                </div>

                <p className="text-sm font-semibold text-primary">
                  {formData.headline || "Software Engineer / Builder"}
                </p>

                <p className="text-xs text-base-content/70 leading-relaxed min-h-[2.5rem]">
                  {formData.bio || "Add your bio to introduce your tech passions and project interests..."}
                </p>

                <div className="flex items-center gap-4 text-xs text-base-content/60 pt-2 border-t border-base-200">
                  <span>📍 {formData.location || "Remote"}</span>
                  <span>🛡️ Role: {user?.role || "USER"}</span>
                </div>

                {/* Skills Matrix Badge List */}
                <div className="pt-3 border-t border-base-200">
                  <span className="text-[11px] font-bold text-base-content/50 uppercase block mb-2">
                    Verified Skill Matrix ({skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {skills.map((skill) => (
                      <SkillBadge key={skill.id} name={skill.name} level={skill.level} />
                    ))}
                    {skills.length === 0 && (
                      <span className="text-xs text-base-content/40 italic">
                        No skills added yet. Use the Skill Matrix tab to add skills.
                      </span>
                    )}
                  </div>
                </div>

                {/* Social Links */}
                {(formData.githubUrl || formData.linkedinUrl) && (
                  <div className="flex gap-2 pt-3 border-t border-base-200">
                    {formData.githubUrl && (
                      <a
                        href={formData.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-xs btn-outline border-base-300 rounded-lg gap-1"
                      >
                        🐱 GitHub
                      </a>
                    )}
                    {formData.linkedinUrl && (
                      <a
                        href={formData.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-xs btn-outline border-base-300 rounded-lg gap-1"
                      >
                        💼 LinkedIn
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Modern Profile Tab Workspace */}
        <div className="lg:col-span-7 space-y-6">
          {/* Navigation Tabs */}
          <div className="tabs tabs-boxed bg-base-100 p-1.5 rounded-2xl border border-base-300 shadow-xs flex">
            <button
              onClick={() => setActiveTab("general")}
              className={`tab tab-lg flex-1 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === "general" ? "tab-active bg-primary text-primary-content shadow-sm" : ""
              }`}
            >
              👤 General & Bio
            </button>
            <button
              onClick={() => setActiveTab("skills")}
              className={`tab tab-lg flex-1 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === "skills" ? "tab-active bg-primary text-primary-content shadow-sm" : ""
              }`}
            >
              🛠️ Skill Matrix
            </button>
            <button
              onClick={() => setActiveTab("social")}
              className={`tab tab-lg flex-1 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                activeTab === "social" ? "tab-active bg-primary text-primary-content shadow-sm" : ""
              }`}
            >
              🌐 Social & Pairing
            </button>
          </div>

          {/* TAB 1: General & Bio */}
          {activeTab === "general" && (
            <div className="card bg-base-100 border border-base-300 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-base-content flex items-center gap-2">
                <span>👤</span> Basic Profile Details
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Avatar Image Upload & Preset Selector */}
                <div className="space-y-3 p-4 bg-base-200/50 rounded-2xl border border-base-300">
                  <div className="flex justify-between items-center">
                    <span className="label-text font-bold text-xs uppercase tracking-wider text-base-content/70">
                      Avatar Image & Presets
                    </span>
                    <span className="badge badge-primary badge-outline text-[10px] font-mono font-bold">
                      Cloudinary / Storage Supported ☁️
                    </span>
                  </div>

                  {/* Upload Image File Input */}
                  <div className="flex flex-col sm:flex-row gap-2 items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileChange}
                      disabled={uploadingAvatar}
                      className="file-input file-input-bordered file-input-primary file-input-sm w-full rounded-xl text-xs"
                    />
                    {uploadingAvatar && (
                      <span className="loading loading-spinner loading-sm text-primary"></span>
                    )}
                  </div>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-base-300"></div>
                    <span className="flex-shrink mx-2 text-[10px] uppercase font-bold text-base-content/40">Or Enter URL / Presets</span>
                    <div className="flex-grow border-t border-base-300"></div>
                  </div>

                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    className="input input-bordered input-sm sm:input-md rounded-xl w-full text-sm"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  />

                  <div className="flex flex-wrap gap-2 items-center pt-1">
                    <span className="text-xs font-semibold text-base-content/60">Generate Preset:</span>
                    <button
                      type="button"
                      onClick={() => setAvatarPreset("avataaars")}
                      className="btn btn-xs btn-outline rounded-lg"
                    >
                      🎨 Avataaars
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarPreset("bottts")}
                      className="btn btn-xs btn-outline rounded-lg"
                    >
                      🤖 Robots
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarPreset("identicon")}
                      className="btn btn-xs btn-outline rounded-lg"
                    >
                      🧩 Identicon
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarPreset("thumbs")}
                      className="btn btn-xs btn-outline rounded-lg"
                    >
                      👍 Thumbs
                    </button>
                  </div>
                </div>

                {/* Name Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold">First Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="input input-bordered rounded-xl w-full"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold">Last Name</span>
                    </label>
                    <input
                      type="text"
                      required
                      className="input input-bordered rounded-xl w-full"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Headline & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold">Headline / Title</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Full-Stack Engineer | React & Node.js"
                      className="input input-bordered rounded-xl w-full"
                      value={formData.headline}
                      onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold">Location</span>
                    </label>
                    <input
                      type="text"
                      placeholder="San Francisco, CA / Remote"
                      className="input input-bordered rounded-xl w-full"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    />
                  </div>
                </div>

                {/* Bio */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Developer Bio</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell other developers about your coding journey, key tech stack, and pair building projects..."
                    className="textarea textarea-bordered rounded-2xl w-full text-sm leading-relaxed"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  />
                </div>

                <Button type="submit" loading={saving} className="w-full btn-primary rounded-xl font-bold">
                  Save General Profile Info 💾
                </Button>
              </form>
            </div>
          )}

          {/* TAB 2: Skill Matrix */}
          {activeTab === "skills" && (
            <div className="card bg-base-100 border border-base-300 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
              <div>
                <h2 className="text-xl font-black text-base-content flex items-center gap-2">
                  <span>🛠️</span> Technical Skills & Proficiency Matrix
                </h2>
                <p className="text-xs text-base-content/60 mt-1">
                  Categorize your technical proficiency from Beginner to Expert.
                </p>
              </div>

              {/* Add Skill Form */}
              <form
                onSubmit={handleAddSkill}
                className="flex flex-col sm:flex-row gap-3 bg-base-200/60 p-4 rounded-2xl border border-base-300"
              >
                <input
                  type="text"
                  placeholder="Skill Name (e.g. React, PostgreSQL, Docker)"
                  required
                  className="input input-bordered rounded-xl flex-1 input-sm sm:input-md"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                />
                <select
                  className="select select-bordered rounded-xl select-sm sm:select-md font-semibold"
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
                <Button type="submit" className="btn-primary rounded-xl btn-sm sm:btn-md font-bold">
                  + Add Skill
                </Button>
              </form>

              {/* Skill Matrix Table */}
              <div className="overflow-x-auto rounded-2xl border border-base-200">
                <table className="table table-zebra w-full text-sm">
                  <thead>
                    <tr className="bg-base-200/80 text-xs text-base-content/70 uppercase tracking-wider">
                      <th>Skill Name</th>
                      <th>Badge</th>
                      <th>Level</th>
                      <th className="text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skills.map((skill) => (
                      <tr key={skill.id} className="hover">
                        <td className="font-bold text-base-content">{skill.name}</td>
                        <td>
                          <SkillBadge name={skill.name} level={skill.level} />
                        </td>
                        <td>
                          <select
                            className="select select-bordered select-xs rounded-lg font-medium"
                            value={skill.level}
                            onChange={(e) => handleSetSkillLevel(skill.name, e.target.value)}
                          >
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                            <option value="EXPERT">Expert</option>
                          </select>
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => handleRemoveSkill(skill.name)}
                            className="btn btn-ghost btn-xs text-error font-bold"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}

                    {skills.length === 0 && !loadingSkills && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-xs text-base-content/50">
                          No skills added yet. Add your skills above.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Social & Pairing */}
          {activeTab === "social" && (
            <div className="card bg-base-100 border border-base-300 shadow-xl rounded-3xl p-6 sm:p-8 space-y-6 animate-fade-in">
              <h2 className="text-xl font-black text-base-content flex items-center gap-2">
                <span>🌐</span> Social Links & Pair Programming Availability
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* Experience Level */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-bold">Overall Experience Level</span>
                  </label>
                  <select
                    className="select select-bordered rounded-xl w-full text-sm font-semibold"
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                  >
                    <option value="BEGINNER">Beginner (0-1 Yrs)</option>
                    <option value="JUNIOR">Junior (1-2 Yrs)</option>
                    <option value="MID_LEVEL">Mid-Level (2-4 Yrs)</option>
                    <option value="SENIOR">Senior (4-7 Yrs)</option>
                    <option value="EXPERT">Expert (7+ Yrs)</option>
                  </select>
                </div>

                {/* GitHub & LinkedIn URLs */}
                <div className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold">GitHub Profile URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://github.com/yourusername"
                      className="input input-bordered rounded-xl w-full"
                      value={formData.githubUrl}
                      onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-bold">LinkedIn Profile URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://linkedin.com/in/yourusername"
                      className="input input-bordered rounded-xl w-full"
                      value={formData.linkedinUrl}
                      onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                    />
                  </div>
                </div>

                {/* Open To Pair Programming Toggle */}
                <div className="flex items-center justify-between p-4 bg-base-200/60 rounded-2xl border border-base-300">
                  <div>
                    <h3 className="font-bold text-sm text-base-content">Open to Pair Programming</h3>
                    <p className="text-xs text-base-content/60">
                      Allows developers on DevTinder to send you connection requests
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary toggle-lg"
                    checked={formData.isOpenToPairing}
                    onChange={(e) => setFormData({ ...formData, isOpenToPairing: e.target.checked })}
                  />
                </div>

                <Button type="submit" loading={saving} className="w-full btn-primary rounded-xl font-bold">
                  Save Social & Pairing Settings 💾
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
