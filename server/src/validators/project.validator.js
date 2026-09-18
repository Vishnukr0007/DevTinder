export const validateProjectInput = (req, res, next) => {
  const { title, description, techStack } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({ success: false, message: "Project title is required" });
  }

  if (!description || typeof description !== "string" || description.trim() === "") {
    return res.status(400).json({ success: false, message: "Project description is required" });
  }

  if (!techStack || !Array.isArray(techStack) || techStack.length === 0) {
    return res.status(400).json({ success: false, message: "techStack must be a non-empty array of strings" });
  }

  next();
};
