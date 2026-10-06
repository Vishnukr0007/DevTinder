import { fetchApi } from "./api.js";

export const connectionApi = {
  getDiscoveryFeed: (page = 1, limit = 10, filters = {}) => {
    const params = new URLSearchParams({ page, limit, ...filters });
    return fetchApi(`/discovery/feed?${params.toString()}`, { method: "GET" });
  },
  searchDevelopers: (q) => fetchApi(`/discovery/search?q=${encodeURIComponent(q)}`, { method: "GET" }),
  filterDevelopers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchApi(`/discovery/filter?${query}`, { method: "GET" });
  },
  getDeveloperProfile: (id) => fetchApi(`/discovery/developer/${id}`, { method: "GET" }),
  saveDeveloper: (id) => fetchApi(`/discovery/save/${id}`, { method: "POST" }),
  unsaveDeveloper: (id) => fetchApi(`/discovery/save/${id}`, { method: "DELETE" }),
  getSavedDevelopers: () => fetchApi("/discovery/saved", { method: "GET" }),
  connectDeveloper: (id) => fetchApi(`/discovery/connect/${id}`, { method: "POST" }),
  skipDeveloper: (id) => fetchApi(`/discovery/skip/${id}`, { method: "POST" }),
  getConnections: () => fetchApi("/connections", { method: "GET" }),
  getPendingRequests: () => fetchApi("/connections/pending", { method: "GET" }),
  acceptRequest: (requestId) => fetchApi(`/connections/accept/${requestId}`, { method: "POST" }),
  rejectRequest: (requestId) => fetchApi(`/connections/reject/${requestId}`, { method: "POST" }),
  removeConnection: (targetUserId) => fetchApi(`/connections/${targetUserId}`, { method: "DELETE" }),
};
