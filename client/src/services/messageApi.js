import { fetchApi } from "./api.js";

export const messageApi = {
  getConversations: () => fetchApi("/messages/conversations", { method: "GET" }),
  getConversation: (partnerId) => fetchApi(`/messages/${partnerId}`, { method: "GET" }),
  sendMessage: (receiverId, content) => fetchApi(`/messages/${receiverId}`, { method: "POST", body: { content } }),
  markMessagesAsRead: (senderId) => fetchApi(`/messages/read/${senderId}`, { method: "PUT" }),
};
