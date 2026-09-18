import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { messageApi } from "../../services/messageApi.js";
import Loader from "../../components/Loader/Loader.jsx";

export const Messages = () => {
  const { user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const res = await messageApi.getConversations();
      if (res.success) {
        setConversations(res.conversations || []);
        if (res.conversations?.length > 0 && !activePartner) {
          setActivePartner(res.conversations[0].partner);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  const loadChat = async (partnerId) => {
    try {
      const res = await messageApi.getConversation(partnerId);
      if (res.success) {
        setMessages(res.messages || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (activePartner) {
      loadChat(activePartner.id);
    }
  }, [activePartner]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner) return;

    try {
      const res = await messageApi.sendMessage(activePartner.id, newMessage.trim());
      if (res.success) {
        setMessages((prev) => [...prev, res.data]);
        setNewMessage("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="card bg-base-100 border border-base-300 shadow-xl rounded-3xl overflow-hidden min-h-[600px] flex flex-col md:flex-row">
      {/* Conversation List Sidebar */}
      <div className="w-full md:w-80 border-r border-base-200 p-4 space-y-4 bg-base-200/40">
        <h2 className="font-black text-lg text-base-content">💬 Chats</h2>
        {loading ? (
          <Loader text="Loading chats..." />
        ) : (
          <div className="space-y-2">
            {conversations.map(({ partner, isOnline, lastMessage, unreadCount }) => (
              <div
                key={partner.id}
                onClick={() => setActivePartner(partner)}
                className={`p-3 rounded-2xl cursor-pointer flex items-center gap-3 transition-colors ${
                  activePartner?.id === partner.id ? "bg-primary/10 border border-primary/30" : "hover:bg-base-200"
                }`}
              >
                <div className={`avatar ${isOnline ? "online" : "offline"}`}>
                  <div className="w-12 rounded-full">
                    <img src={partner.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.id}`} alt={partner.firstName} />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <p className="font-bold text-sm text-base-content truncate">{partner.firstName} {partner.lastName}</p>
                    {unreadCount > 0 && <span className="badge badge-primary badge-xs">{unreadCount}</span>}
                  </div>
                  <p className="text-xs text-base-content/60 truncate">{lastMessage || "Click to open chat"}</p>
                </div>
              </div>
            ))}

            {conversations.length === 0 && (
              <div className="text-center py-8 text-xs text-base-content/50">
                No active connection chats. Connect with developers to unlock 1-on-1 messaging!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between bg-base-100">
        {activePartner ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-base-200 flex items-center gap-3 bg-base-100">
              <div className="avatar">
                <div className="w-10 rounded-full">
                  <img src={activePartner.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${activePartner.id}`} alt="Partner" />
                </div>
              </div>
              <div>
                <h3 className="font-bold text-sm text-base-content">{activePartner.firstName} {activePartner.lastName}</h3>
                <p className="text-[10px] text-success font-semibold">● Connected Developer</p>
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 max-h-[420px]">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                return (
                  <div key={msg.id} className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                    <div className={`chat-bubble ${isMe ? "chat-bubble-primary" : "bg-base-200 text-base-content"} text-sm rounded-2xl`}>
                      {msg.content}
                    </div>
                    <div className="chat-footer text-[10px] opacity-50 mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                );
              })}

              {messages.length === 0 && (
                <div className="text-center py-12 text-xs text-base-content/40">
                  Say hello to start the conversation! 💬
                </div>
              )}
            </div>

            {/* Input Box */}
            <form onSubmit={handleSend} className="p-4 border-t border-base-200 flex gap-2">
              <input
                type="text"
                placeholder="Type a message or code snippet..."
                className="input input-bordered rounded-2xl flex-1 text-sm"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary rounded-2xl">
                Send 🚀
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center flex-1 p-8 text-center text-xs text-base-content/50">
            Select a connection chat from the left to begin messaging.
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
