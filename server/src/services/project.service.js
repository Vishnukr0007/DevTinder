import prisma from "../config/prisma.js";

export const createProjectService = async (userId, data) => {
  const { title, description, techStack, repoUrl, liveUrl, maxMembers = 5 } = data;

  return prisma.project.create({
    data: {
      userId,
      title: title.trim(),
      description: description.trim(),
      techStack,
      repoUrl: repoUrl ? repoUrl.trim() : null,
      liveUrl: liveUrl ? liveUrl.trim() : null,
      maxMembers: parseInt(maxMembers, 10) || 5,
      status: "RECRUITING",
      members: {
        create: {
          userId,
          role: "OWNER",
          status: "ACCEPTED",
        },
      },
    },
    include: { members: true },
  });
};

export const joinProjectService = async (userId, projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { where: { status: "ACCEPTED" } } },
  });

  if (!project) throw new Error("Project not found");
  if (project.members.length >= project.maxMembers) throw new Error("Project team is full");

  return prisma.projectMember.create({
    data: {
      projectId,
      userId,
      role: "MEMBER",
      status: "PENDING",
    },
  });
};
