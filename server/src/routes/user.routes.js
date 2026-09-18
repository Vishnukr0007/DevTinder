import express from "express";
import { getProfile } from "../controllers/user.controller.js";
import { updateProfile, addSkillHandler, removeSkillHandler } from "../controllers/profile.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.post("/skills", addSkillHandler);
router.delete("/skills/:name", removeSkillHandler);

export default router;
