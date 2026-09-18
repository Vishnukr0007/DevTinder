import prisma from "../config/prisma.js";

export const getConversationService = async (userA, userB) => {
  const connection = await prisma.connectionRequest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    },
  });

  if (!connection) {
    const error = new Error("Messaging is only allowed between connected developers.");
    error.statusCode = 403;
    throw error;
  }

  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userA, receiverId: userB },
        { senderId: userB, receiverId: userA },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  await prisma.message.updateMany({
    where: { senderId: userB, receiverId: userA, isRead: false },
    data: { isRead: true },
  });

  return messages;
};

export const sendMessageService = async (senderId, receiverId, content) => {
  const connection = await prisma.connectionRequest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    },
  });

  if (!connection) {
    const error = new Error("Messaging is only allowed between connected developers.");
    error.statusCode = 403;
    throw error;
  }

  return prisma.message.create({
    data: {
      senderId,
      receiverId,
      content: content.trim(),
      isRead: false,
    },
  });
};
