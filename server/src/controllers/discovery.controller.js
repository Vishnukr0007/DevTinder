import prisma from "../config/prisma.js";

/**
 * @desc    Get Discovery Feed (Browse Developers card deck)
 * @route   GET /api/discovery/feed
 * @access  Private
 */
export const getDiscoveryFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // 1. Fetch user's existing sent/received connection request IDs to exclude
    const existingConnections = await prisma.connectionRequest.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      select: { senderId: true, receiverId: true },
    });

    const excludedUserIds = new Set([
      userId,
      ...existingConnections.map((c) => (c.senderId === userId ? c.receiverId : c.senderId)),
    ]);

    // 2. Query available developers excluding self and already interacted profiles
    const developers = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(excludedUserIds) },
        role: "USER",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        headline: true,
        bio: true,
        avatarUrl: true,
        location: true,
        experienceLevel: true,
        isOpenToPairing: true,
        githubUrl: true,
        linkedinUrl: true,
        userSkills: {
          select: { name: true, level: true },
        },
        projects: {
          select: { id: true, title: true, description: true, techStack: true, repoUrl: true, liveUrl: true },
        },
        createdAt: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Fetch user's saved developer IDs for frontend UI toggle state
    const savedRecords = await prisma.savedDeveloper.findMany({
      where: { userId },
      select: { savedId: true },
    });
    const savedSet = new Set(savedRecords.map((s) => s.savedId));

    const formattedDevelopers = developers.map((dev) => ({
      ...dev,
      isSaved: savedSet.has(dev.id),
    }));

    return res.status(200).json({
      success: true,
      page,
      limit,
      count: formattedDevelopers.length,
      developers: formattedDevelopers,
    });
  } catch (error) {
    console.error("Get Discovery Feed Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching discovery feed",
    });
  }
};

/**
 * @desc    Search Developers by name, headline, bio, or location
 * @route   GET /api/discovery/search
 * @access  Private
 */
export const searchDevelopers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { q } = req.query;

    if (!q || typeof q !== "string" || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query string parameter 'q' is required",
      });
    }

    const queryStr = q.trim();

    const developers = await prisma.user.findMany({
      where: {
        id: { not: userId },
        role: "USER",
        OR: [
          { firstName: { contains: queryStr, mode: "insensitive" } },
          { lastName: { contains: queryStr, mode: "insensitive" } },
          { headline: { contains: queryStr, mode: "insensitive" } },
          { bio: { contains: queryStr, mode: "insensitive" } },
          { location: { contains: queryStr, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        headline: true,
        bio: true,
        avatarUrl: true,
        location: true,
        experienceLevel: true,
        isOpenToPairing: true,
        userSkills: { select: { name: true, level: true } },
      },
      take: 20,
    });

    return res.status(200).json({
      success: true,
      count: developers.length,
      developers,
    });
  } catch (error) {
    console.error("Search Developers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error performing developer search",
    });
  }
};

/**
 * @desc    Filter Developers by tech skills, experience level, pairing status, location
 * @route   GET /api/discovery/filter
 * @access  Private
 */
export const filterDevelopers = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills, experienceLevel, isOpenToPairing, location } = req.query;

    const whereClause = {
      id: { not: userId },
      role: "USER",
    };

    if (experienceLevel) {
      whereClause.experienceLevel = experienceLevel.toUpperCase();
    }

    if (isOpenToPairing !== undefined) {
      whereClause.isOpenToPairing = isOpenToPairing === "true";
    }

    if (location) {
      whereClause.location = { contains: location.trim(), mode: "insensitive" };
    }

    if (skills) {
      const skillList = skills.split(",").map((s) => s.trim().toLowerCase());
      whereClause.userSkills = {
        some: {
          name: { in: skillList, mode: "insensitive" },
        },
      };
    }

    const developers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        headline: true,
        bio: true,
        avatarUrl: true,
        location: true,
        experienceLevel: true,
        isOpenToPairing: true,
        userSkills: { select: { name: true, level: true } },
        projects: { select: { id: true, title: true, techStack: true } },
      },
      take: 30,
    });

    return res.status(200).json({
      success: true,
      count: developers.length,
      developers,
    });
  } catch (error) {
    console.error("Filter Developers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error filtering developers",
    });
  }
};

/**
 * @desc    View Detailed Developer Profile
 * @route   GET /api/discovery/developer/:id
 * @access  Private
 */
export const getDeveloperProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user.id;

    const developer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        headline: true,
        bio: true,
        avatarUrl: true,
        location: true,
        experienceLevel: true,
        isOpenToPairing: true,
        githubUrl: true,
        linkedinUrl: true,
        createdAt: true,
        userSkills: { select: { id: true, name: true, level: true } },
        projects: true,
      },
    });

    if (!developer) {
      return res.status(404).json({
        success: false,
        message: "Developer profile not found",
      });
    }

    // Check connection status between current user and target developer
    const connection = await prisma.connectionRequest.findFirst({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: id },
          { senderId: id, receiverId: currentUserId },
        ],
      },
    });

    // Check if saved
    const isSavedRecord = await prisma.savedDeveloper.findUnique({
      where: {
        userId_savedId: { userId: currentUserId, savedId: id },
      },
    });

    return res.status(200).json({
      success: true,
      developer: {
        ...developer,
        connectionStatus: connection ? connection.status : "NONE",
        isSender: connection ? connection.senderId === currentUserId : false,
        isSaved: Boolean(isSavedRecord),
      },
    });
  } catch (error) {
    console.error("Get Developer Profile Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching profile details",
    });
  }
};

/**
 * @desc    Save / Bookmark Developer
 * @route   POST /api/discovery/save/:id
 * @access  Private
 */
export const saveDeveloper = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: savedId } = req.params;

    if (userId === savedId) {
      return res.status(400).json({
        success: false,
        message: "You cannot save your own profile",
      });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: savedId } });
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "Developer not found" });
    }

    const savedRecord = await prisma.savedDeveloper.upsert({
      where: {
        userId_savedId: { userId, savedId },
      },
      update: {},
      create: { userId, savedId },
    });

    return res.status(200).json({
      success: true,
      message: `Developer ${targetUser.firstName} ${targetUser.lastName} saved to bookmarks`,
      savedRecord,
    });
  } catch (error) {
    console.error("Save Developer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error saving developer profile",
    });
  }
};

/**
 * @desc    Unsave / Remove Bookmarked Developer
 * @route   DELETE /api/discovery/save/:id
 * @access  Private
 */
export const unsaveDeveloper = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: savedId } = req.params;

    await prisma.savedDeveloper.deleteMany({
      where: { userId, savedId },
    });

    return res.status(200).json({
      success: true,
      message: "Developer removed from saved bookmarks",
    });
  } catch (error) {
    console.error("Unsave Developer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error removing saved developer",
    });
  }
};

/**
 * @desc    Get List of Saved Developers
 * @route   GET /api/discovery/saved
 * @access  Private
 */
export const getSavedDevelopers = async (req, res) => {
  try {
    const userId = req.user.id;

    const savedRecords = await prisma.savedDeveloper.findMany({
      where: { userId },
      include: {
        savedUser: {
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
      count: savedRecords.length,
      savedDevelopers: savedRecords.map((r) => r.savedUser),
    });
  } catch (error) {
    console.error("Get Saved Developers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching saved developers",
    });
  }
};

/**
 * @desc    Connect with Developer ("Swipe Right")
 * @route   POST /api/discovery/connect/:id
 * @access  Private
 */
export const connectDeveloper = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { id: receiverId } = req.params;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a connection request to yourself",
      });
    }

    // Check if target user already sent a connection request to current user
    const reverseRequest = await prisma.connectionRequest.findUnique({
      where: {
        senderId_receiverId: { senderId: receiverId, receiverId: senderId },
      },
    });

    if (reverseRequest) {
      // Auto-Match! Mutually ACCEPTED
      const updatedMatch = await prisma.connectionRequest.update({
        where: { id: reverseRequest.id },
        data: { status: "ACCEPTED" },
      });

      return res.status(200).json({
        success: true,
        isMatch: true,
        message: "It's a Match! You are now connected with this developer.",
        connection: updatedMatch,
      });
    }

    // Create new PENDING connection request
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
      message: "Connection request sent successfully",
      connection,
    });
  } catch (error) {
    console.error("Connect Developer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error sending connection request",
    });
  }
};

/**
 * @desc    Skip Developer ("Swipe Left")
 * @route   POST /api/discovery/skip/:id
 * @access  Private
 */
export const skipDeveloper = async (req, res) => {
  try {
    const senderId = req.user.id;
    const { id: receiverId } = req.params;

    if (senderId === receiverId) {
      return res.status(400).json({
        success: false,
        message: "Invalid skip request",
      });
    }

    const skippedRecord = await prisma.connectionRequest.upsert({
      where: {
        senderId_receiverId: { senderId, receiverId },
      },
      update: { status: "IGNORED" },
      create: { senderId, receiverId, status: "IGNORED" },
    });

    return res.status(200).json({
      success: true,
      message: "Developer skipped",
      connection: skippedRecord,
    });
  } catch (error) {
    console.error("Skip Developer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error skipping developer",
    });
  }
};
