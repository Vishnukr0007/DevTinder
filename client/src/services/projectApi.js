import { fetchApi } from "./api.js";

export const projectApi = {
  getAllProjects: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/projects?${query}`, { method: "GET" });
  },
  getProjectById: (id) => fetchApi(`/projects/${id}`, { method: "GET" }),
  createProject: (projectData) => fetchApi("/projects", { method: "POST", body: projectData }),
  joinProject: (id) => fetchApi(`/projects/${id}/join`, { method: "POST" }),
  inviteDeveloper: (id, developerId) => fetchApi(`/projects/${id}/invite/${developerId}`, { method: "POST" }),
  leaveProject: (id) => fetchApi(`/projects/${id}/leave`, { method: "DELETE" }),
  manageProject: (id, data) => fetchApi(`/projects/${id}`, { method: "PUT", body: data }),
  reviewJoinRequest: (id, memberId, action) => fetchApi(`/projects/${id}/review/${memberId}`, { method: "POST", body: { action } }),
  deleteProject: (id) => fetchApi(`/projects/${id}`, { method: "DELETE" }),
};
