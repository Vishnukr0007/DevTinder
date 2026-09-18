import { getUserById } from "../services/user.service.js";

export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User profile not found" });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
