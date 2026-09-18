import express from "express";
import {
  getAllProjects,
  getProjectById,
  createProject,
  joinProject,
  inviteDeveloper,
  leaveProject,
  manageProject,
  reviewJoinRequest,
  deleteProject,
} from "../controllers/project.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public / Protected Project Browse
router.get("/", getAllProjects);
router.get("/:id", protect, getProjectById);

// Protected Project Operations
router.post("/", protect, createProject);
router.post("/:id/join", protect, joinProject);
router.post("/:id/invite/:developerId", protect, inviteDeveloper);
router.delete("/:id/leave", protect, leaveProject);

// Project Management Routes (Owner Only)
router.put("/:id", protect, manageProject);
router.post("/:id/review/:memberId", protect, reviewJoinRequest);
router.delete("/:id", protect, deleteProject);

export default router;
