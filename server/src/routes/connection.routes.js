import express from "express";
import {
  getConnections,
  getPendingRequests,
  sendRequest,
  acceptRequest,
  rejectRequest,
  removeConnection,
} from "../controllers/connection.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All connection endpoints require authentication
router.use(protect);

router.get("/", getConnections);
router.get("/pending", getPendingRequests);
router.post("/request/:receiverId", sendRequest);
router.post("/accept/:requestId", acceptRequest);
router.post("/reject/:requestId", rejectRequest);
router.delete("/:targetUserId", removeConnection);

export default router;
