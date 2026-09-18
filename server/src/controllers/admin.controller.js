import prisma from "../config/prisma.js";

/**
 * 📊 1. ADMIN DASHBOARD OVERVIEW & SYSTEM METRICS
 * @route   GET /api/admin/dashboard
 * @access  Private (ADMIN Only)
 */
export const getAdminDashboardMetrics = async (req, res) => {
  try {
    const totalUsers = await prisma.user.count();
    const developerUsers = await prisma.user.count({ where: { role: "USER" } });
    const adminUsers = await prisma.user.count({ where: { role: "ADMIN" } });
    const modUsers = await prisma.user.count({ where: { role: "MODERATOR" } });

    const totalMatches = await prisma.connectionRequest.count({ where: { status: "ACCEPTED" } });
    const totalPendingConnections = await prisma.connectionRequest.count({ where: { status: "PENDING" } });

    const totalMessages = await prisma.message.count();
    const totalProjects = await prisma.project.count();
    const activeProjects = await prisma.project.count({ where: { status: "RECRUITING" } });

    const pendingReports = await prisma.report.count({ where: { status: "PENDING" } });

    return res.status(200).json({
      success: true,
      metrics: {
        users: {
          total: totalUsers,
          developers: developerUsers,
          admins: adminUsers,
          moderators: modUsers,
        },
        connections: {
          totalMatches,
          pendingRequests: totalPendingConnections,
        },
        messaging: {
          totalMessages,
        },
        projects: {
          total: totalProjects,
          recruiting: activeProjects,
        },
        moderation: {
          pendingReports,
        },
        systemStatus: "Healthy - All Services Operational",
      },
    });
  } catch (error) {
    console.error("Admin Dashboard Metrics Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching admin metrics",
    });
  }
};

/**
 * 👥 2. USERS MANAGEMENT
 * @route   GET /api/admin/users
 * @access  Private (ADMIN Only)
 */
export const getAdminUsersList = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const { search, role } = req.query;

    const whereClause = {};

    if (role) {
      whereClause.role = role.toUpperCase();
    }

    if (search) {
      const searchStr = search.trim();
      whereClause.OR = [
        { firstName: { contains: searchStr, mode: "insensitive" } },
        { lastName: { contains: searchStr, mode: "insensitive" } },
        { email: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        headline: true,
        avatarUrl: true,
        createdAt: true,
        _count: {
          select: {
            projects: true,
            sentConnections: true,
            userSkills: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    const totalCount = await prisma.user.count({ where: whereClause });

    return res.status(200).json({
      success: true,
      page,
      limit,
      totalCount,
      users,
    });
  } catch (error) {
    console.error("Get Admin Users Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching users",
    });
  }
};

/**
 * 🛡️ Change User Role (ADMIN Only)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private (ADMIN Only)
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const ALLOWED_ROLES = ["USER", "ADMIN", "MODERATOR"];
    if (!role || !ALLOWED_ROLES.includes(role.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Allowed values: ${ALLOWED_ROLES.join(", ")}`,
      });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() },
      select: { id: true, email: true, role: true },
    });

    return res.status(200).json({
      success: true,
      message: `User ${user.email} role updated to '${user.role}'`,
      user,
    });
  } catch (error) {
    console.error("Update User Role Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error updating user role",
    });
  }
};

/**
 * ⛔ Suspend / Unsuspend User Account (ADMIN Only)
 * @route   POST /api/admin/users/:id/suspend
 * @access  Private (ADMIN Only)
 */
export const toggleUserSuspension = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.role === "ADMIN") {
      return res.status(403).json({ success: false, message: "Cannot suspend an Admin user" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isSuspended: Boolean(isSuspended) },
      select: { id: true, email: true, isSuspended: true },
    });

    return res.status(200).json({
      success: true,
      message: `User ${updatedUser.email} status set to ${updatedUser.isSuspended ? "SUSPENDED" : "ACTIVE"}`,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Toggle User Suspension Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error suspending user",
    });
  }
};

/**
 * ❌ Delete / Ban User (ADMIN Only)
 * @route   DELETE /api/admin/users/:id
 * @access  Private (ADMIN Only)
 */
export const deleteUserAccount = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    await prisma.user.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: `User account ${user.email} deleted from platform`,
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error deleting user account",
    });
  }
};

/**
 * 🚩 3. REPORTS MANAGEMENT
 * @route   GET /api/admin/reports
 * @access  Private (ADMIN / MODERATOR)
 */
export const getAdminReportsList = async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        targetUser: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: reports.length,
      reports,
    });
  } catch (error) {
    console.error("Get Admin Reports Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching reports",
    });
  }
};

/**
 * Resolve / Dismiss Report
 * @route   POST /api/admin/reports/:id/resolve
 * @access  Private (ADMIN / MODERATOR)
 */
export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status = "RESOLVED" } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: { status: status.toUpperCase() },
    });

    return res.status(200).json({
      success: true,
      message: `Report status updated to '${report.status}'`,
      report,
    });
  } catch (error) {
    console.error("Resolve Report Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error resolving report",
    });
  }
};

/**
 * 🏗️ 4. PROJECTS MANAGEMENT (ADMIN View)
 * @route   GET /api/admin/projects
 * @access  Private (ADMIN Only)
 */
export const getAdminProjectsList = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get Admin Projects Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching projects",
    });
  }
};

/**
 * 💡 5. SKILLS TAXONOMY & AUDIT
 * @route   GET /api/admin/skills
 * @access  Private (ADMIN Only)
 */
export const getAdminSkillsTaxonomy = async (req, res) => {
  try {
    const skillsGrouped = await prisma.userSkill.groupBy({
      by: ["name"],
      _count: { name: true },
      orderBy: { _count: { name: "desc" } },
      take: 50,
    });

    return res.status(200).json({
      success: true,
      skills: skillsGrouped.map((s) => ({
        skillName: s.name,
        developerCount: s._count.name,
      })),
    });
  } catch (error) {
    console.error("Get Admin Skills Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching skills taxonomy",
    });
  }
};

/**
 * ⚙️ 6. PLATFORM SETTINGS MANAGEMENT
 * @route   GET /api/admin/settings
 * @route   PUT /api/admin/settings
 * @access  Private (ADMIN Only)
 */
export const getPlatformSettings = async (req, res) => {
  try {
    const settings = await prisma.systemSetting.findMany();
    return res.status(200).json({ success: true, settings });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching settings" });
  }
};

export const updatePlatformSetting = async (req, res) => {
  try {
    const { key, value, description } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ success: false, message: "Setting key and value are required" });
    }

    const setting = await prisma.systemSetting.upsert({
      where: { key },
      update: { value: String(value), description },
      create: { key, value: String(value), description },
    });

    return res.status(200).json({
      success: true,
      message: `System setting '${key}' updated`,
      setting,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating setting" });
  }
};
