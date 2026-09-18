import prisma from "../config/prisma.js";
import { getIO, getOnlineUsers } from "../sockets/socket.js";

/**
 * Helper to check if two users have an active mutual connection
 */
const checkActiveConnection = async (userA, userB) => {
  const connection = await prisma.connectionRequest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    },
  });
  return Boolean(connection);
};

/**
 * @desc    Get Chat History / Conversation with a connected developer
 * @route   GET /api/messages/:partnerId
 * @access  Private
 */
export const getConversation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { partnerId } = req.params;

    // 1. Verify active connection requirement
    const isConnected = await checkActiveConnection(userId, partnerId);
    if (!isConnected) {
      return res.status(403).json({
        success: false,
        message: "Messaging is only allowed between connected developers. Please connect first.",
      });
    }

    // 2. Fetch conversation messages
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: "asc" },
    });

    // 3. Mark unread messages sent by partner as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    // Emit read receipt event via Socket.IO if sender is online
    const io = getIO();
    const onlineUsers = getOnlineUsers();
    const partnerSocketId = onlineUsers.get(partnerId);
    if (io && partnerSocketId) {
      io.to(partnerSocketId).emit("messages_read", { readBy: userId, conversationWith: partnerId });
    }

    return res.status(200).json({
      success: true,
      count: messages.length,
      messages,
    });
  } catch (error) {
    console.error("Get Conversation Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching conversation messages",
    });
  }
};

/**
 * @desc    Send Message to a connected developer
 * @route   POST /api/messages/:receiverId
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;
    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    // 1. Verify connection condition
    const isConnected = await checkActiveConnection(senderId, receiverId);
    if (!isConnected) {
      return res.status(403).json({
        success: false,
        message: "Messaging is only allowed between connected developers.",
      });
    }

    // 2. Save message to DB
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content: content.trim(),
        isRead: false,
      },
    });

    // 3. Trigger Real-time WebSocket delivery
    const io = getIO();
    const onlineUsers = getOnlineUsers();
    const receiverSocketId = onlineUsers.get(receiverId);

    if (io && receiverSocketId) {
      io.to(receiverSocketId).emit("receive_message", {
        message,
        sender: {
          id: req.user.id,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
        },
      });
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send Message Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error sending message",
    });
  }
};

/**
 * @desc    Mark conversation messages as read
 * @route   PUT /api/messages/read/:senderId
 * @access  Private
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const { senderId } = req.params;

    await prisma.message.updateMany({
      where: {
        senderId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    const io = getIO();
    const onlineUsers = getOnlineUsers();
    const senderSocketId = onlineUsers.get(senderId);

    if (io && senderSocketId) {
      io.to(senderSocketId).emit("messages_read", {
        readBy: userId,
        senderId,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Mark Messages As Read Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error marking messages as read",
    });
  }
};

/**
 * @desc    Get List of Conversations with unread message counts
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getConversationsList = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all active connections
    const connections = await prisma.connectionRequest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, headline: true },
        },
        receiver: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, headline: true },
        },
      },
    });

    const onlineUsers = getOnlineUsers();

    const conversations = await Promise.all(
      connections.map(async (conn) => {
        const partner = conn.senderId === userId ? conn.receiver : conn.sender;

        // Fetch latest message
        const lastMessage = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: partner.id },
              { senderId: partner.id, receiverId: userId },
            ],
          },
          orderBy: { createdAt: "desc" },
        });

        // Fetch unread count
        const unreadCount = await prisma.message.count({
          where: {
            senderId: partner.id,
            receiverId: userId,
            isRead: false,
          },
        });

        return {
          partner,
          isOnline: onlineUsers.has(partner.id),
          lastMessage: lastMessage ? lastMessage.content : null,
          lastMessageAt: lastMessage ? lastMessage.createdAt : conn.updatedAt,
          unreadCount,
        };
      })
    );

    // Sort by latest message time
    conversations.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error("Get Conversations List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching conversations list",
    });
  }
};
