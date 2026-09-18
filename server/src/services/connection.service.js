import prisma from "../config/prisma.js";

export const getDiscoveryFeed = async (userId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const existingConnections = await prisma.connectionRequest.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    select: { senderId: true, receiverId: true },
  });

  const excludedUserIds = new Set([
    userId,
    ...existingConnections.map((c) => (c.senderId === userId ? c.receiverId : c.senderId)),
  ]);

  const developers = await prisma.user.findMany({
    where: { id: { notIn: Array.from(excludedUserIds) }, role: "USER" },
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
      projects: { select: { id: true, title: true, description: true } },
    },
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const savedRecords = await prisma.savedDeveloper.findMany({
    where: { userId },
    select: { savedId: true },
  });
  const savedSet = new Set(savedRecords.map((s) => s.savedId));

  return developers.map((d) => ({ ...d, isSaved: savedSet.has(d.id) }));
};

export const sendConnectionRequest = async (senderId, receiverId) => {
  if (senderId === receiverId) throw new Error("Cannot connect to yourself");

  const reverseRequest = await prisma.connectionRequest.findUnique({
    where: { senderId_receiverId: { senderId: receiverId, receiverId: senderId } },
  });

  if (reverseRequest) {
    const match = await prisma.connectionRequest.update({
      where: { id: reverseRequest.id },
      data: { status: "ACCEPTED" },
    });
    return { isMatch: true, connection: match };
  }

  const connection = await prisma.connectionRequest.upsert({
    where: { senderId_receiverId: { senderId, receiverId } },
    update: { status: "PENDING" },
    create: { senderId, receiverId, status: "PENDING" },
  });

  return { isMatch: false, connection };
};
