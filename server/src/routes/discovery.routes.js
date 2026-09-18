import express from "express";
import {
  getDiscoveryFeed,
  searchDevelopers,
  filterDevelopers,
  getDeveloperProfile,
  saveDeveloper,
  unsaveDeveloper,
  getSavedDevelopers,
  connectDeveloper,
  skipDeveloper,
} from "../controllers/discovery.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All discovery endpoints require authentication
router.use(protect);

router.get("/feed", getDiscoveryFeed);
router.get("/search", searchDevelopers);
router.get("/filter", filterDevelopers);
router.get("/saved", getSavedDevelopers);
router.get("/developer/:id", getDeveloperProfile);

router.post("/save/:id", saveDeveloper);
router.delete("/save/:id", unsaveDeveloper);

router.post("/connect/:id", connectDeveloper);
router.post("/skip/:id", skipDeveloper);

export default router;
