import express from "express";
import {
  getUserSkills,
  addSkill,
  setSkillLevel,
  removeSkill,
  bulkSetSkills,
} from "../controllers/skill.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All skill management routes require authentication
router.use(protect);

router.get("/", getUserSkills);
router.post("/", addSkill);
router.put("/bulk", bulkSetSkills);
router.put("/:name/level", setSkillLevel);
router.delete("/:name", removeSkill);

export default router;
