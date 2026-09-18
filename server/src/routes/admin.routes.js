import express from "express";
import {
  getAdminDashboardMetrics,
  getAdminUsersList,
  updateUserRole,
  toggleUserSuspension,
  deleteUserAccount,
  getAdminReportsList,
  resolveReport,
  getAdminProjectsList,
  getAdminSkillsTaxonomy,
  getPlatformSettings,
  updatePlatformSetting,
} from "../controllers/admin.controller.js";
import { protect, authorize } from "../middleware/auth.middleware.js";

const router = express.Router();

// All admin routes require authentication
router.use(protect);

// 1. Admin Dashboard Overview
router.get("/dashboard", authorize("ADMIN"), getAdminDashboardMetrics);

// 2. Users Hub
router.get("/users", authorize("ADMIN"), getAdminUsersList);
router.put("/users/:id/role", authorize("ADMIN"), updateUserRole);
router.post("/users/:id/suspend", authorize("ADMIN"), toggleUserSuspension);
router.delete("/users/:id", authorize("ADMIN"), deleteUserAccount);

// 3. Reports Hub (Accessible by ADMIN & MODERATOR)
router.get("/reports", authorize("ADMIN", "MODERATOR"), getAdminReportsList);
router.post("/reports/:id/resolve", authorize("ADMIN", "MODERATOR"), resolveReport);

// 4. Projects Hub
router.get("/projects", authorize("ADMIN"), getAdminProjectsList);

// 5. Skills Taxonomy Hub
router.get("/skills", authorize("ADMIN"), getAdminSkillsTaxonomy);

// 6. Platform Settings Hub
router.get("/settings", authorize("ADMIN"), getPlatformSettings);
router.put("/settings", authorize("ADMIN"), updatePlatformSetting);

export default router;
