import prisma from "../config/prisma.js";

/**
 * @desc    Get all active mutual connections (ACCEPTED status)
 * @route   GET /api/connections
 * @access  Private
 */
export const getConnections = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all accepted connections where current user is sender or receiver
    const connections = await prisma.connectionRequest.findMany({
      where: {
        status: "ACCEPTED",
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            headline: true,
            bio: true,
            avatarUrl: true,
            location: true,
            experienceLevel: true,
            isOpenToPairing: true,
            userSkills: { select: { name: true, level: true } },
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            headline: true,
            bio: true,
            avatarUrl: true,
            location: true,
            experienceLevel: true,
            isOpenToPairing: true,
            userSkills: { select: { name: true, level: true } },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Format output to return the connected partner's profile
    const formattedConnections = connections.map((conn) => {
      const partner = conn.senderId === userId ? conn.receiver : conn.sender;
      return {
        connectionId: conn.id,
        connectedAt: conn.updatedAt,
        user: partner,
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedConnections.length,
      connections: formattedConnections,
    });
  } catch (error) {
    console.error("Get Connections Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching connections",
    });
  }
};

/**
 * @desc    Get all incoming & outgoing pending connection requests
 * @route   GET /api/connections/pending
 * @access  Private
 */
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user.id;

    // Incoming requests (Other users sent request to current user)
    const incomingRequests = await prisma.connectionRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
            location: true,
            userSkills: { select: { name: true, level: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Outgoing requests (Current user sent request to other users)
    const outgoingRequests = await prisma.connectionRequest.findMany({
      where: {
        senderId: userId,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            headline: true,
            avatarUrl: true,
            location: true,
            userSkills: { select: { name: true, level: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      incomingCount: incomingRequests.length,
      outgoingCount: outgoingRequests.length,
      incoming: incomingRequests.map((r) => ({
        requestId: r.id,
        createdAt: r.createdAt,
        user: r.sender,
      })),
      outgoing: outgoingRequests.map((r) => ({
        requestId: r.id,
        createdAt: r.createdAt,
        user: r.receiver,
      })),
    });
  } catch (error) {
    console.error("Get Pending Requests Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching pending requests",
    });
  }
};

/**
 * @desc    Send Connection Request
 * @route   POST /api/connections/request/:receiverId
 * @access  Private
 */
export const sendRequest = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId } = req.params;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a connection request to yourself",
      });
    }

    const receiverUser = await prisma.user.findUnique({ where: { id: receiverId } });
    if (!receiverUser) {
      return res.status(404).json({ success: false, message: "Target developer not found" });
    }

    // Check if reverse request exists
    const reverseRequest = await prisma.connectionRequest.findUnique({
      where: {
        senderId_receiverId: { senderId: receiverId, receiverId: senderId },
      },
    });

    if (reverseRequest) {
      // Auto-Match!
      const match = await prisma.connectionRequest.update({
        where: { id: reverseRequest.id },
        data: { status: "ACCEPTED" },
      });

      return res.status(200).json({
        success: true,
        isMatch: true,
        message: `It's a Match! You and ${receiverUser.firstName} are now connected.`,
        connection: match,
      });
    }

    const connection = await prisma.connectionRequest.upsert({
      where: {
        senderId_receiverId: { senderId, receiverId },
      },
      update: { status: "PENDING" },
      create: { senderId, receiverId, status: "PENDING" },
    });

    return res.status(201).json({
      success: true,
      isMatch: false,
      message: `Connection request sent to ${receiverUser.firstName}`,
      connection,
    });
  } catch (error) {
    console.error("Send Connection Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error sending connection request",
    });
  }
};

/**
 * @desc    Accept Incoming Connection Request
 * @route   POST /api/connections/accept/:requestId
 * @access  Private
 */
export const acceptRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const request = await prisma.connectionRequest.findUnique({
      where: { id: requestId },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    if (request.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to accept this connection request",
      });
    }

    const acceptedConnection = await prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });

    return res.status(200).json({
      success: true,
      message: `Accepted connection request from ${request.sender.firstName} ${request.sender.lastName}`,
      connection: acceptedConnection,
    });
  } catch (error) {
    console.error("Accept Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error accepting connection request",
    });
  }
};

/**
 * @desc    Reject Incoming Connection Request
 * @route   POST /api/connections/reject/:requestId
 * @access  Private
 */
export const rejectRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { requestId } = req.params;

    const request = await prisma.connectionRequest.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    if (request.receiverId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to reject this request",
      });
    }

    const rejectedConnection = await prisma.connectionRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" },
    });

    return res.status(200).json({
      success: true,
      message: "Connection request rejected",
      connection: rejectedConnection,
    });
  } catch (error) {
    console.error("Reject Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error rejecting connection request",
    });
  }
};

/**
 * @desc    Remove Active Connection (Unmatch)
 * @route   DELETE /api/connections/:targetUserId
 * @access  Private
 */
export const removeConnection = async (req, res) => {
  try {
    const userId = req.user.id;
    const { targetUserId } = req.params;

    const existingConnection = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId },
        ],
      },
    });

    if (!existingConnection) {
      return res.status(404).json({
        success: false,
        message: "Active connection not found",
      });
    }

    await prisma.connectionRequest.delete({
      where: { id: existingConnection.id },
    });

    return res.status(200).json({
      success: true,
      message: "Connection removed successfully",
    });
  } catch (error) {
    console.error("Remove Connection Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error removing connection",
    });
  }
};
