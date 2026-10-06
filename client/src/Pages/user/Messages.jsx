import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { messageApi } from "../../services/messageApi.js";
import { useSocket } from "../../context/SocketContext.jsx";
import { useToast } from "../../context/ToastContext.jsx";
import Loader from "../../components/Loader/Loader.jsx";

const formatDateHeader = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return "Today";
  if (isYesterday) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

export const Messages = () => {
  const { user } = useSelector((state) => state.auth);
  const {
    sendMessage: sendSocketMessage,
    isUserOnline,
    typingUsers,
    startTyping,
    stopTyping,
    markMessagesRead,
    subscribeToMessages,
    subscribeToReadReceipts,
    isConnected,
  } = useSocket();
  const { error: toastError } = useToast();

  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [drafts, setDrafts] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
  };

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
        markMessagesRead(partnerId);
        setConversations((prev) =>
          prev.map((c) => (c.partner.id === partnerId ? { ...c, unreadCount: 0 } : c))
        );
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

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, typingUsers]);

  // Handle partner selection with draft saving
  const handleSelectPartner = (partner) => {
    if (activePartner) {
      setDrafts((prev) => ({ ...prev, [activePartner.id]: newMessage }));
    }
    setActivePartner(partner);
    setNewMessage(drafts[partner.id] || "");
  };

  // Subscribe to real-time incoming messages
  useEffect(() => {
    const unsubscribeMessages = subscribeToMessages((incomingMessage) => {
      if (activePartner && incomingMessage.senderId === activePartner.id) {
        setMessages((prev) => [...prev, incomingMessage]);
        markMessagesRead(activePartner.id);

        setConversations((prev) =>
          prev.map((c) =>
            c.partner.id === activePartner.id
              ? { ...c, lastMessage: incomingMessage.content, lastMessageAt: new Date().toISOString() }
              : c
          )
        );
        return true;
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.partner.id === incomingMessage.senderId
            ? {
                ...c,
                lastMessage: incomingMessage.content,
                lastMessageAt: new Date().toISOString(),
                unreadCount: (c.unreadCount || 0) + 1,
              }
            : c
        )
      );
      return false;
    });

    return unsubscribeMessages;
  }, [activePartner, subscribeToMessages, markMessagesRead]);

  // Subscribe to real-time read receipts
  useEffect(() => {
    const unsubscribeRead = subscribeToReadReceipts(({ readBy }) => {
      if (activePartner && readBy === activePartner.id) {
        setMessages((prev) =>
          prev.map((msg) => (msg.senderId === user?.id ? { ...msg, isRead: true } : msg))
        );
      }
    });

    return unsubscribeRead;
  }, [activePartner, subscribeToReadReceipts, user?.id]);

  // Handle typing indicator
  const handleInputChange = (e) => {
    const val = e.target.value;
    setNewMessage(val);
    if (!activePartner) return;

    if (val.trim()) {
      startTyping(activePartner.id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(activePartner.id);
      }, 2000);
    } else {
      stopTyping(activePartner.id);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activePartner || isSending) return;

    const content = newMessage.trim();
    setNewMessage("");
    setDrafts((prev) => ({ ...prev, [activePartner.id]: "" }));
    stopTyping(activePartner.id);

    try {
      setIsSending(true);
      let sentMsg;

      if (isConnected) {
        sentMsg = await sendSocketMessage(activePartner.id, content);
      } else {
        const res = await messageApi.sendMessage(activePartner.id, content);
        if (res.success) sentMsg = res.data;
      }

      if (sentMsg) {
        setMessages((prev) => [...prev, sentMsg]);
        setConversations((prev) =>
          prev.map((c) =>
            c.partner.id === activePartner.id
              ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Message delivery failed:", err);
      toastError(err.message || "Failed to deliver message");
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((c) =>
    `${c.partner.firstName} ${c.partner.lastName} ${c.partner.headline || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const isPartnerOnline = activePartner ? isUserOnline(activePartner.id) : false;
  const isPartnerTyping = activePartner ? typingUsers.get(activePartner.id) : false;

  return (
    <div className="card bg-base-100 border border-base-300 shadow-2xl rounded-3xl overflow-hidden min-h-[640px] flex flex-col md:flex-row">
      {/* Conversation List Sidebar */}
      <div
        className={`w-full md:w-80 border-r border-base-200 p-4 space-y-4 bg-base-200/40 flex flex-col ${
          activePartner ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-black text-lg text-base-content flex items-center gap-2">
            💬 Messages
          </h2>
          <span
            className={`badge badge-xs px-2 py-1 gap-1 font-semibold ${
              isConnected ? "badge-success text-success-content" : "badge-warning text-warning-content animate-pulse"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-success-content" : "bg-warning-content"}`} />
            {isConnected ? "Live" : "Connecting..."}
          </span>
        </div>

        {/* Conversation Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search connections..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-sm input-bordered w-full rounded-2xl bg-base-100 text-xs focus:outline-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1.5 text-xs text-base-content/50 hover:text-base-content"
            >
              ✕
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-12">
            <Loader text="Loading conversations..." />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredConversations.map(({ partner, lastMessage, unreadCount }) => {
              const online = isUserOnline(partner.id);
              const isSelected = activePartner?.id === partner.id;

              return (
                <div
                  key={partner.id}
                  onClick={() => handleSelectPartner(partner)}
                  className={`p-3 rounded-2xl cursor-pointer flex items-center gap-3 transition-all duration-200 ${
                    isSelected
                      ? "bg-primary text-primary-content shadow-md"
                      : "hover:bg-base-200/80 text-base-content"
                  }`}
                >
                  <div className={`avatar ${online ? "online" : "offline"}`}>
                    <div className="w-12 rounded-full ring-2 ring-base-100">
                      <img
                        src={
                          partner.avatarUrl ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.id}`
                        }
                        alt={partner.firstName}
                      />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <p className="font-bold text-sm truncate">
                        {partner.firstName} {partner.lastName}
                      </p>
                      {unreadCount > 0 && (
                        <span
                          className={`badge badge-xs font-bold ${
                            isSelected
                              ? "bg-primary-content text-primary"
                              : "badge-primary animate-pulse"
                          }`}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-xs truncate ${
                        isSelected ? "text-primary-content/80" : "text-base-content/60"
                      }`}
                    >
                      {drafts[partner.id] ? (
                        <span className="italic opacity-80">Draft: {drafts[partner.id]}</span>
                      ) : (
                        lastMessage || "Start chatting..."
                      )}
                    </p>
                  </div>
                </div>
              );
            })}

            {filteredConversations.length === 0 && (
              <div className="text-center py-12 text-xs text-base-content/50 space-y-1">
                <p className="text-xl">🔍</p>
                <p>{searchQuery ? "No matching connections found" : "No active connection chats"}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Chat Conversation Window */}
      <div
        className={`flex-1 flex flex-col justify-between bg-base-100 ${
          activePartner ? "flex" : "hidden md:flex"
        }`}
      >
        {activePartner ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-base-200 flex items-center justify-between bg-base-100/90 backdrop-blur-sm sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {/* Mobile Back Button */}
                <button
                  onClick={() => setActivePartner(null)}
                  className="btn btn-ghost btn-xs btn-circle md:hidden"
                  title="Back to conversations"
                >
                  ⬅️
                </button>

                <div className={`avatar ${isPartnerOnline ? "online" : "offline"}`}>
                  <div className="w-10 rounded-full ring-2 ring-primary/20">
                    <img
                      src={
                        activePartner.avatarUrl ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${activePartner.id}`
                      }
                      alt="Partner Avatar"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-base-content flex items-center gap-2">
                    {activePartner.firstName} {activePartner.lastName}
                  </h3>
                  <p className="text-[11px] flex items-center gap-1.5">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isPartnerOnline ? "bg-success animate-ping" : "bg-base-content/30"
                      }`}
                    />
                    <span className="text-base-content/60 font-medium">
                      {isPartnerOnline ? "Online & Available" : "Offline"}
                    </span>
                  </p>
                </div>
              </div>

              {activePartner.headline && (
                <span className="badge badge-outline text-[11px] hidden lg:inline-flex max-w-[220px] truncate">
                  💻 {activePartner.headline}
                </span>
              )}
            </div>

            {/* Messages Scroll Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 max-h-[460px] bg-base-200/20">
              {messages.map((msg, index) => {
                const isMe = msg.senderId === user?.id;
                const currentDateHeader = formatDateHeader(msg.createdAt);
                const prevDateHeader =
                  index > 0 ? formatDateHeader(messages[index - 1].createdAt) : null;
                const showDateHeader = currentDateHeader !== prevDateHeader;

                return (
                  <React.Fragment key={msg.id || index}>
                    {showDateHeader && (
                      <div className="flex items-center justify-center my-3">
                        <span className="badge badge-ghost badge-sm text-[10px] text-base-content/60 font-semibold px-3 py-1">
                          {currentDateHeader}
                        </span>
                      </div>
                    )}

                    <div className={`chat ${isMe ? "chat-end" : "chat-start"}`}>
                      <div
                        className={`chat-bubble text-sm rounded-2xl shadow-sm break-words whitespace-pre-wrap max-w-[85%] ${
                          isMe
                            ? "chat-bubble-primary text-primary-content"
                            : "bg-base-100 text-base-content border border-base-300"
                        }`}
                      >
                        {msg.content}
                      </div>

                      <div className="chat-footer text-[10px] opacity-60 mt-1 flex items-center gap-1">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {isMe && (
                          <span
                            className={`font-mono font-bold ${
                              msg.isRead ? "text-primary" : "opacity-70"
                            }`}
                            title={msg.isRead ? "Read" : "Delivered"}
                          >
                            {msg.isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Typing Indicator */}
              {isPartnerTyping && (
                <div className="chat chat-start">
                  <div className="chat-bubble bg-base-100 border border-base-300 text-xs italic text-base-content/70 rounded-2xl flex items-center gap-2 py-2 px-3 shadow-xs">
                    <span>{activePartner.firstName} is typing</span>
                    <span className="loading loading-dots loading-xs text-primary"></span>
                  </div>
                </div>
              )}

              {/* Empty Message Placeholder */}
              {messages.length === 0 && (
                <div className="text-center py-16 text-xs text-base-content/40 space-y-2">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto text-2xl">
                    🚀
                  </div>
                  <p className="font-semibold text-sm text-base-content/70">
                    No messages yet with {activePartner.firstName}
                  </p>
                  <p>Send a message to start pair programming & collaborating!</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer Form */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-base-200 flex gap-2 bg-base-100 items-center"
            >
              <input
                type="text"
                placeholder={`Message ${activePartner.firstName}...`}
                className="input input-bordered rounded-2xl flex-1 text-sm focus:outline-primary bg-base-200/30"
                value={newMessage}
                onChange={handleInputChange}
                disabled={isSending}
              />
              <button
                type="submit"
                className="btn btn-primary rounded-2xl px-6 font-bold"
                disabled={isSending || !newMessage.trim()}
              >
                {isSending ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <span>Send 🚀</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 p-8 text-center space-y-3">
            <div className="w-20 h-20 rounded-full bg-base-200 flex items-center justify-center text-3xl">
              💬
            </div>
            <h3 className="font-bold text-base text-base-content">Your Developer Conversations</h3>
            <p className="text-xs text-base-content/60 max-w-sm">
              Select a connected developer from the sidebar to start pair programming discussions, code sharing, or project recruitment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;

