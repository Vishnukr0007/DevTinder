import { fetchApi } from "./api.js";

export const userApi = {
  updateProfile: (profileData) => fetchApi("/user/profile", { method: "PUT", body: profileData }),
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);
    return fetchApi("/user/upload-avatar", {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getSkills: () => fetchApi("/user/skills", { method: "GET" }),
  addSkill: (skillData) => fetchApi("/user/skills", { method: "POST", body: skillData }),
  setSkillLevel: (name, level) => fetchApi(`/user/skills/${encodeURIComponent(name)}/level`, { method: "PUT", body: { level } }),
  removeSkill: (name) => fetchApi(`/user/skills/${encodeURIComponent(name)}`, { method: "DELETE" }),
  bulkSetSkills: (skills) => fetchApi("/user/skills/bulk", { method: "PUT", body: { skills } }),
};
