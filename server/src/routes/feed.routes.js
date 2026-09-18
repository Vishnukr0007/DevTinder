import express from "express";
import { getFeed } from "../controllers/feed.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getFeed);

export default router;
