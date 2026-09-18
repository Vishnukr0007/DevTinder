import express from "express";
import {
  getConversationsList,
  getConversation,
  sendMessage,
  markMessagesAsRead,
} from "../controllers/message.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

// All messaging endpoints require authentication
router.use(protect);

router.get("/conversations", getConversationsList);
router.get("/:partnerId", getConversation);
router.post("/:receiverId", sendMessage);
router.put("/read/:senderId", markMessagesAsRead);

export default router;
