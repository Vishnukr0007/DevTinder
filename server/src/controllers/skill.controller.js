import prisma from "../config/prisma.js";

const VALID_SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

/**
 * @desc    Get current developer's skills with levels
 * @route   GET /api/skills
 * @access  Private
 */
export const getUserSkills = async (req, res) => {
  try {
    const userId = req.user.id;

    const skills = await prisma.userSkill.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        level: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      count: skills.length,
      skills,
    });
  } catch (error) {
    console.error("Get User Skills Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching skills",
    });
  }
};

/**
 * @desc    Add a new skill or update existing skill level
 * @route   POST /api/skills
 * @access  Private
 */
export const addSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, level = "BEGINNER" } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Skill name is required",
      });
    }

    const formattedLevel = level.toUpperCase();
    if (!VALID_SKILL_LEVELS.includes(formattedLevel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid skill level. Allowed values: ${VALID_SKILL_LEVELS.join(", ")}`,
      });
    }

    const formattedName = name.trim();

    // Upsert skill (Add new skill or update level if already exists)
    const skill = await prisma.userSkill.upsert({
      where: {
        userId_name: {
          userId,
          name: formattedName,
        },
      },
      update: {
        level: formattedLevel,
      },
      create: {
        userId,
        name: formattedName,
        level: formattedLevel,
      },
    });

    // Also sync string array on User model for backward compatibility
    await syncUserSkillsArray(userId);

    return res.status(201).json({
      success: true,
      message: `Skill '${skill.name}' set to level '${skill.level}' successfully`,
      skill,
    });
  } catch (error) {
    console.error("Add Skill Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error adding skill",
    });
  }
};

/**
 * @desc    Set level for an existing skill
 * @route   PUT /api/skills/:name/level
 * @access  Private
 */
export const setSkillLevel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.params;
    const { level } = req.body;

    if (!level) {
      return res.status(400).json({
        success: false,
        message: "Skill level is required (BEGINNER, INTERMEDIATE, ADVANCED, EXPERT)",
      });
    }

    const formattedLevel = level.toUpperCase();
    if (!VALID_SKILL_LEVELS.includes(formattedLevel)) {
      return res.status(400).json({
        success: false,
        message: `Invalid skill level. Allowed values: ${VALID_SKILL_LEVELS.join(", ")}`,
      });
    }

    const decodedName = decodeURIComponent(name).trim();

    const existingSkill = await prisma.userSkill.findUnique({
      where: {
        userId_name: {
          userId,
          name: decodedName,
        },
      },
    });

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: `Skill '${decodedName}' not found in your profile`,
      });
    }

    const updatedSkill = await prisma.userSkill.update({
      where: { id: existingSkill.id },
      data: { level: formattedLevel },
    });

    return res.status(200).json({
      success: true,
      message: `Skill '${updatedSkill.name}' level updated to '${updatedSkill.level}'`,
      skill: updatedSkill,
    });
  } catch (error) {
    console.error("Set Skill Level Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error updating skill level",
    });
  }
};

/**
 * @desc    Remove a skill from developer profile
 * @route   DELETE /api/skills/:name
 * @access  Private
 */
export const removeSkill = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.params;

    const decodedName = decodeURIComponent(name).trim();

    const existingSkill = await prisma.userSkill.findUnique({
      where: {
        userId_name: {
          userId,
          name: decodedName,
        },
      },
    });

    if (!existingSkill) {
      return res.status(404).json({
        success: false,
        message: `Skill '${decodedName}' not found in your profile`,
      });
    }

    await prisma.userSkill.delete({
      where: { id: existingSkill.id },
    });

    // Sync string array on User model
    await syncUserSkillsArray(userId);

    return res.status(200).json({
      success: true,
      message: `Skill '${decodedName}' removed successfully`,
    });
  } catch (error) {
    console.error("Remove Skill Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error removing skill",
    });
  }
};

/**
 * @desc    Bulk set/update developer skills list
 * @route   PUT /api/skills/bulk
 * @access  Private
 */
export const bulkSetSkills = async (req, res) => {
  try {
    const userId = req.user.id;
    const { skills } = req.body; // Array of { name, level }

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array of objects containing name and level",
      });
    }

    // Process each skill in a transaction
    await prisma.$transaction(async (tx) => {
      // Clear existing skills for clean set
      await tx.userSkill.deleteMany({ where: { userId } });

      // Create new skills batch
      const newSkillsData = skills.map((s) => ({
        userId,
        name: s.name.trim(),
        level: (s.level || "BEGINNER").toUpperCase(),
      }));

      await tx.userSkill.createMany({
        data: newSkillsData,
      });
    });

    await syncUserSkillsArray(userId);

    const updatedSkills = await prisma.userSkill.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return res.status(200).json({
      success: true,
      message: "Skills list updated successfully",
      count: updatedSkills.length,
      skills: updatedSkills,
    });
  } catch (error) {
    console.error("Bulk Set Skills Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error performing bulk skills update",
    });
  }
};

/**
 * Helper to sync User model's `skills` string array with UserSkill table
 */
async function syncUserSkillsArray(userId) {
  try {
    const userSkills = await prisma.userSkill.findMany({
      where: { userId },
      select: { name: true },
    });
    const skillNames = userSkills.map((s) => s.name);
    await prisma.user.update({
      where: { id: userId },
      data: { skills: skillNames },
    });
  } catch (err) {
    console.error("Failed to sync skills array:", err);
  }
}
