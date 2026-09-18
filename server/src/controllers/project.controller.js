import prisma from "../config/prisma.js";

/**
 * @desc    Get All Projects (Browse Project Feed with filters)
 * @route   GET /api/projects
 * @access  Private / Public
 */
export const getAllProjects = async (req, res) => {
  try {
    const { status, techStack, search } = req.query;

    const whereClause = {};

    if (status) {
      whereClause.status = status.toUpperCase();
    }

    if (techStack) {
      const stackList = techStack.split(",").map((s) => s.trim().toLowerCase());
      whereClause.techStack = {
        hasSome: stackList,
      };
    }

    if (search) {
      const searchStr = search.trim();
      whereClause.OR = [
        { title: { contains: searchStr, mode: "insensitive" } },
        { description: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    const projects = await prisma.project.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, headline: true },
        },
        members: {
          where: { status: "ACCEPTED" },
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get All Projects Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching projects",
    });
  }
};

/**
 * @desc    Get Detailed Project Info
 * @route   GET /api/projects/:id
 * @access  Private
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, email: true, headline: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true, headline: true },
            },
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const userMembership = project.members.find((m) => m.userId === userId);

    return res.status(200).json({
      success: true,
      project: {
        ...project,
        isOwner: project.userId === userId,
        userRole: userMembership ? userMembership.role : null,
        userJoinStatus: userMembership ? userMembership.status : "NONE",
      },
    });
  } catch (error) {
    console.error("Get Project By ID Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching project details",
    });
  }
};

/**
 * @desc    Create a New Project (Owner)
 * @route   POST /api/projects
 * @access  Private
 */
export const createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, techStack, repoUrl, liveUrl, maxMembers = 5 } = req.body;

    if (!title || !description || !techStack || !Array.isArray(techStack)) {
      return res.status(400).json({
        success: false,
        message: "Title, description, and techStack (array) are required",
      });
    }

    // Create project and auto-add owner as ProjectMember (OWNER, ACCEPTED)
    const project = await prisma.project.create({
      data: {
        userId,
        title: title.trim(),
        description: description.trim(),
        techStack: techStack.map((s) => s.trim()),
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
      include: {
        members: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create Project Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error creating project",
    });
  }
};

/**
 * @desc    Join Project (Apply to join open project)
 * @route   POST /api/projects/:id/join
 * @access  Private
 */
export const joinProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { where: { status: "ACCEPTED" } } },
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.status === "COMPLETED") {
      return res.status(400).json({ success: false, message: "Project is already completed" });
    }

    if (project.members.length >= project.maxMembers) {
      return res.status(400).json({ success: false, message: "Project team is full" });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: `You have already applied or joined this project. Current status: ${existingMember.status}`,
      });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: "MEMBER",
        status: "PENDING",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Application to join project submitted successfully",
      member,
    });
  } catch (error) {
    console.error("Join Project Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error joining project",
    });
  }
};

/**
 * @desc    Invite Developer to Project (Owner only)
 * @route   POST /api/projects/:id/invite/:developerId
 * @access  Private
 */
export const inviteDeveloper = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: projectId, developerId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.userId !== userId) {
      return res.status(403).json({ success: false, message: "Only project owner can invite developers" });
    }

    const existingMember = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: developerId } },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "Developer is already invited or part of this project",
      });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: developerId,
        role: "MEMBER",
        status: "INVITED",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Developer invited to project team",
      member,
    });
  } catch (error) {
    console.error("Invite Developer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error inviting developer",
    });
  }
};

/**
 * @desc    Leave Project (Member action)
 * @route   DELETE /api/projects/:id/leave
 * @access  Private
 */
export const leaveProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: projectId } = req.params;

    const member = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });

    if (!member) {
      return res.status(404).json({ success: false, message: "You are not a member of this project" });
    }

    if (member.role === "OWNER") {
      return res.status(400).json({
        success: false,
        message: "Project owner cannot leave. Transfer ownership or delete the project instead.",
      });
    }

    await prisma.projectMember.delete({
      where: { id: member.id },
    });

    return res.status(200).json({
      success: true,
      message: "You have left the project workspace",
    });
  } catch (error) {
    console.error("Leave Project Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error leaving project",
    });
  }
};

/**
 * @desc    Manage / Update Project (Owner only)
 * @route   PUT /api/projects/:id
 * @access  Private
 */
export const manageProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: projectId } = req.params;
    const { title, description, techStack, repoUrl, liveUrl, status, maxMembers } = req.body;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.userId !== userId) {
      return res.status(403).json({ success: false, message: "Only project owner can manage project details" });
    }

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: {
        title: title ? title.trim() : project.title,
        description: description ? description.trim() : project.description,
        techStack: Array.isArray(techStack) ? techStack : project.techStack,
        repoUrl: repoUrl !== undefined ? repoUrl : project.repoUrl,
        liveUrl: liveUrl !== undefined ? liveUrl : project.liveUrl,
        status: status ? status.toUpperCase() : project.status,
        maxMembers: maxMembers ? parseInt(maxMembers, 10) : project.maxMembers,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error("Manage Project Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error updating project",
    });
  }
};

/**
 * @desc    Approve / Reject Member Join Request (Owner only)
 * @route   POST /api/projects/:id/review/:memberId
 * @access  Private
 */
export const reviewJoinRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: projectId, memberId } = req.params;
    const { action } = req.body; // "ACCEPT" or "REJECT"

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized or project not found" });
    }

    const targetStatus = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";

    const member = await prisma.projectMember.update({
      where: { id: memberId },
      data: { status: targetStatus },
    });

    return res.status(200).json({
      success: true,
      message: `Project join request ${action === "ACCEPT" ? "approved" : "rejected"}`,
      member,
    });
  } catch (error) {
    console.error("Review Join Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error reviewing join request",
    });
  }
};

/**
 * @desc    Delete Project (Owner only)
 * @route   DELETE /api/projects/:id
 * @access  Private
 */
export const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: projectId } = req.params;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.userId !== userId) {
      return res.status(403).json({ success: false, message: "Only project owner can delete project" });
    }

    await prisma.project.delete({ where: { id: projectId } });

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete Project Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error deleting project",
    });
  }
};
