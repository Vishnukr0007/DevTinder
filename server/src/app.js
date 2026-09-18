import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import prisma from './config/prisma.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { ApiResponse } from './utils/response.js';
import { asyncHandler } from './utils/asyncHandler.js';
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import feedRoutes from "./routes/feed.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import discoveryRoutes from "./routes/discovery.routes.js";
import connectionRoutes from "./routes/connection.routes.js";
import messageRoutes from "./routes/message.routes.js";
import projectRoutes from "./routes/project.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Global Middlewares
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/feed", feedRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/discovery", discoveryRoutes);
app.use("/api/connections", connectionRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/admin", adminRoutes);

// Health Check Endpoint (Verifies Express + PostgreSQL status)
app.get('/api/health', asyncHandler(async (req, res) => {
  // Test query to PostgreSQL
  await prisma.$queryRaw`SELECT 1`;

  res.status(200).json(
    new ApiResponse(
      200,
      {
        timestamp: new Date().toISOString(),
        database: 'Connected (PostgreSQL - DevTinder)',
        status: 'Healthy'
      },
      'DevTinder Backend API and Database are running smoothly'
    )
  );
}));

// Root Route
app.get('/', (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { name: 'DevTinder API', version: '1.0.0' }, 'Welcome to DevTinder API')
  );
});

// 404 Route Not Found
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

export default app;
