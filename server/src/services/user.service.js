import prisma from "../config/prisma.js";

export const getUserById = async (userId) => {
  return prisma.user.findUnique({
    where: { id: userId },
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
      role: true,
      isEmailVerified: true,
      isSuspended: true,
      githubUrl: true,
      linkedinUrl: true,
      userSkills: { select: { id: true, name: true, level: true } },
      projects: true,
      createdAt: true,
    },
  });
};

export const updateUserProfile = async (userId, data) => {
  return prisma.user.update({
    where: { id: userId },
    data,
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
      role: true,
      isEmailVerified: true,
      isSuspended: true,
      githubUrl: true,
      linkedinUrl: true,
      userSkills: { select: { id: true, name: true, level: true } },
      createdAt: true,
      updatedAt: true,
    },
  });
};

export const addUserSkill = async (userId, name, level) => {
  const formattedName = name.trim();
  const formattedLevel = (level || "BEGINNER").toUpperCase();

  const skill = await prisma.userSkill.upsert({
    where: { userId_name: { userId, name: formattedName } },
    update: { level: formattedLevel },
    create: { userId, name: formattedName, level: formattedLevel },
  });

  const skills = await prisma.userSkill.findMany({ where: { userId }, select: { name: true } });
  await prisma.user.update({
    where: { id: userId },
    data: { skills: skills.map((s) => s.name) },
  });

  return skill;
};

export const removeUserSkill = async (userId, name) => {
  const decodedName = decodeURIComponent(name).trim();

  await prisma.userSkill.deleteMany({
    where: { userId, name: decodedName },
  });

  const skills = await prisma.userSkill.findMany({ where: { userId }, select: { name: true } });
  await prisma.user.update({
    where: { id: userId },
    data: { skills: skills.map((s) => s.name) },
  });

  return true;
};
