import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { useToast } from "./ToastContext.jsx";

const SocketContext = createContext(null);

const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:8000";

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { info } = useToast();

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map()); // partnerId -> boolean
  const socketRef = useRef(null);

  // Subscribers for incoming messages, read receipts & matches
  const messageListenersRef = useRef(new Set());
  const readReceiptListenersRef = useRef(new Set());
  const matchListenersRef = useRef(new Set());

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
      return;
    }

    const socketInstance = io(SOCKET_SERVER_URL, {
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("🟢 Socket connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("⚠️ Socket connection error:", err.message);
    });

    // 1. Initial list of online users
    socketInstance.on("get_online_users", (userIds) => {
      setOnlineUsers(new Set(userIds));
    });

    // 2. Real-time online/offline updates
    socketInstance.on("user_online", ({ userId, onlineUsers: currentOnline }) => {
      if (currentOnline) {
        setOnlineUsers(new Set(currentOnline));
      } else {
        setOnlineUsers((prev) => new Set([...prev, userId]));
      }
    });

    socketInstance.on("user_offline", ({ userId, onlineUsers: currentOnline }) => {
      if (currentOnline) {
        setOnlineUsers(new Set(currentOnline));
      } else {
        setOnlineUsers((prev) => {
          const updated = new Set(prev);
          updated.delete(userId);
          return updated;
        });
      }
    });

    // 3. Incoming Message Listener
    socketInstance.on("receive_message", ({ message, sender }) => {
      // Notify active listeners (e.g. Chat window)
      let handled = false;
      messageListenersRef.current.forEach((listener) => {
        const isHandled = listener(message, sender);
        if (isHandled) handled = true;
      });

      // If user is not currently in this chat, show a toast notification
      if (!handled && message?.senderId) {
        const senderName = sender ? `${sender.firstName}` : "Developer";
        info(`💬 ${senderName}: ${message.content.substring(0, 30)}...`);
      }
    });

    // 4. Read Status Event Listener
    socketInstance.on("messages_read", ({ readBy, senderId }) => {
      readReceiptListenersRef.current.forEach((listener) => {
        listener({ readBy, senderId });
      });
    });

    // 5. New Match Notification Listener
    socketInstance.on("new_match", ({ matchedUser }) => {
      let handled = false;
      matchListenersRef.current.forEach((listener) => {
        const isHandled = listener(matchedUser);
        if (isHandled) handled = true;
      });

      if (!handled) {
        info(`⚡🎉 It's a Match! You and ${matchedUser?.firstName || "a developer"} connected!`);
      }
    });

    // 6. Typing Indicators
    socketInstance.on("typing_start", ({ senderId }) => {
      setTypingUsers((prev) => new Map(prev).set(senderId, true));
    });

    socketInstance.on("typing_stop", ({ senderId }) => {
      setTypingUsers((prev) => {
        const next = new Map(prev);
        next.delete(senderId);
        return next;
      });
    });

    return () => {
      socketInstance.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    };
  }, [isAuthenticated, user?.id, info]);

  // Helper method to subscribe to incoming messages in components
  const subscribeToMessages = useCallback((callback) => {
    messageListenersRef.current.add(callback);
    return () => {
      messageListenersRef.current.delete(callback);
    };
  }, []);

  // Helper method to subscribe to read receipts
  const subscribeToReadReceipts = useCallback((callback) => {
    readReceiptListenersRef.current.add(callback);
    return () => {
      readReceiptListenersRef.current.delete(callback);
    };
  }, []);

  // Send message via WebSocket with promise resolution
  const sendMessage = useCallback((receiverId, content) => {
    return new Promise((resolve, reject) => {
      if (!socketRef.current || !socketRef.current.connected) {
        return reject(new Error("Socket not connected"));
      }

      socketRef.current.emit("send_message", { receiverId, content }, (res) => {
        if (res?.success) {
          resolve(res.message);
        } else {
          reject(new Error(res?.message || "Failed to send message"));
        }
      });
    });
  }, []);

  // Start Typing
  const startTyping = useCallback((receiverId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("typing_start", { receiverId });
    }
  }, []);

  // Stop Typing
  const stopTyping = useCallback((receiverId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("typing_stop", { receiverId });
    }
  }, []);

  // Mark Messages Read
  const markMessagesRead = useCallback((senderId) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("mark_messages_read", { senderId });
    }
  }, []);

  // Check if specific user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  // Helper method to subscribe to real-time matches
  const subscribeToMatch = useCallback((callback) => {
    matchListenersRef.current.add(callback);
    return () => {
      matchListenersRef.current.delete(callback);
    };
  }, []);

  const value = {
    socket,
    isConnected,
    onlineUsers,
    typingUsers,
    sendMessage,
    startTyping,
    stopTyping,
    markMessagesRead,
    isUserOnline,
    subscribeToMessages,
    subscribeToReadReceipts,
    subscribeToMatch,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketContext;
