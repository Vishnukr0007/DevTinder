import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

let io;
// Map storing userId -> socketId
const userSocketMap = new Map();

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || process.env.NODE_ENV !== "production") {
          return callback(null, true);
        }
        return callback(null, origin);
      },
      credentials: true,
    },
  });

  // Socket Authentication Middleware
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.cookie
          ?.split("; ")
          .find((row) => row.startsWith("token="))
          ?.split("=")[1];

      if (!token) {
        return next(new Error("Authentication error: Token missing"));
      }

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "devtinder_jwt_secret_key_2026"
      );

      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("Socket Auth Error:", err.message);
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;
    console.log(`🔌 Developer Connected: User ID [${userId}] (Socket ID: ${socket.id})`);

    // Add user to online map
    userSocketMap.set(userId, socket.id);

    // Broadcast online status to all connected users
    io.emit("user_online", { userId, onlineUsers: Array.from(userSocketMap.keys()) });

    // Send online users list to newly connected user
    socket.emit("get_online_users", Array.from(userSocketMap.keys()));

    // 1. Real-time Message Sending Event
    socket.on("send_message", async (data, callback) => {
      try {
        const { receiverId, content } = data;

        if (!receiverId || !content) {
          if (callback) callback({ success: false, message: "Invalid payload" });
          return;
        }

        // Verify active connection
        const connection = await prisma.connectionRequest.findFirst({
          where: {
            status: "ACCEPTED",
            OR: [
              { senderId: userId, receiverId },
              { senderId: receiverId, receiverId: userId },
            ],
          },
        });

        if (!connection) {
          if (callback) callback({ success: false, message: "Not connected with user" });
          return;
        }

        // Create Message in DB
        const message = await prisma.message.create({
          data: {
            senderId: userId,
            receiverId,
            content: content.trim(),
            isRead: false,
          },
        });

        const sender = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, firstName: true, lastName: true, avatarUrl: true },
        });

        const receiverSocketId = userSocketMap.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receive_message", { message, sender });
        }

        if (callback) callback({ success: true, message });
      } catch (error) {
        console.error("Socket send_message error:", error);
        if (callback) callback({ success: false, message: "Error sending message" });
      }
    });

    // 2. Typing Indicator Events
    socket.on("typing_start", ({ receiverId }) => {
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing_start", { senderId: userId });
      }
    });

    socket.on("typing_stop", ({ receiverId }) => {
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing_stop", { senderId: userId });
      }
    });

    // 3. Read Status Event
    socket.on("mark_messages_read", async ({ senderId }) => {
      try {
        await prisma.message.updateMany({
          where: {
            senderId,
            receiverId: userId,
            isRead: false,
          },
          data: { isRead: true },
        });

        const senderSocketId = userSocketMap.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("messages_read", { readBy: userId, senderId });
        }
      } catch (err) {
        console.error("Socket mark_messages_read error:", err);
      }
    });

    // 4. Disconnect Handler
    socket.on("disconnect", () => {
      console.log(`🔌 Developer Disconnected: User ID [${userId}]`);
      userSocketMap.delete(userId);
      io.emit("user_offline", { userId, onlineUsers: Array.from(userSocketMap.keys()) });
    });
  });

  return io;
};

export const getIO = () => io;
export const getOnlineUsers = () => userSocketMap;
