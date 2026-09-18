const VALID_SKILL_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED", "EXPERT"];

export const validateSkillInput = (req, res, next) => {
  const { name, level } = req.body;

  if (!name || typeof name !== "string" || name.trim() === "") {
    return res.status(400).json({ success: false, message: "Skill name is required" });
  }

  if (level && !VALID_SKILL_LEVELS.includes(level.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: `Invalid skill level. Allowed: ${VALID_SKILL_LEVELS.join(", ")}`,
    });
  }

  next();
};

export const validateProfileUpdate = (req, res, next) => {
  const { firstName, lastName, headline, bio } = req.body;

  if (firstName && typeof firstName !== "string") {
    return res.status(400).json({ success: false, message: "First name must be a string" });
  }

  if (lastName && typeof lastName !== "string") {
    return res.status(400).json({ success: false, message: "Last name must be a string" });
  }

  next();
};
