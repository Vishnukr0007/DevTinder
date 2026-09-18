import { fetchApi } from "./api.js";

export const userApi = {
  updateProfile: (profileData) => fetchApi("/profile", { method: "PUT", body: profileData }),
  getSkills: () => fetchApi("/skills", { method: "GET" }),
  addSkill: (skillData) => fetchApi("/skills", { method: "POST", body: skillData }),
  setSkillLevel: (name, level) => fetchApi(`/skills/${encodeURIComponent(name)}/level`, { method: "PUT", body: { level } }),
  removeSkill: (name) => fetchApi(`/skills/${encodeURIComponent(name)}`, { method: "DELETE" }),
  bulkSetSkills: (skills) => fetchApi("/skills/bulk", { method: "PUT", body: { skills } }),
};
