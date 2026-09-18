import http from 'http';
import app from './app.js';
import { env } from './config/env.js';
import prisma from './config/prisma.js';
import { initSocket } from './sockets/socket.js';

const PORT = env.PORT || 8000;

const startServer = async () => {
  try {
    // 1. Verify PostgreSQL Database Connection
    await prisma.$connect();
    console.log('🐘 Successfully connected to PostgreSQL database (DevTinder)');

    // 2. Create HTTP Server & Attach Socket.IO
    const server = http.createServer(app);
    initSocket(server);

    // 3. Start Server Listening
    server.listen(PORT, () => {
      console.log(`🚀 DevTinder Server listening on http://localhost:${PORT}`);
      console.log(`📡 Environment: ${env.NODE_ENV}`);
      console.log(`🔌 Socket.IO Real-time Messaging Ready`);
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled Promise Rejection:', err);
      server.close(() => process.exit(1));
    });

    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });

  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL database:', error.message);
    process.exit(1);
  }
};

startServer();
