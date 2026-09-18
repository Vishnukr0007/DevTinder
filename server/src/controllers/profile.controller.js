import { updateUserProfile, addUserSkill, removeUserSkill } from "../services/user.service.js";

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await updateUserProfile(userId, req.body);
    return res.status(200).json({ success: true, message: "Profile updated successfully", user });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error updating profile" });
  }
};

export const addSkillHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, level } = req.body;
    const skill = await addUserSkill(userId, name, level);
    return res.status(201).json({ success: true, message: "Skill updated successfully", skill });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error adding skill" });
  }
};

export const removeSkillHandler = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.params;
    await removeUserSkill(userId, name);
    return res.status(200).json({ success: true, message: "Skill removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error removing skill" });
  }
};
