import http from 'http';
import app from './app';
import { connectDB, disconnectDB } from './utils/db';
import { initSocketIO } from './sockets/socketHandler';
import { User } from './models';
import { seedDemoData } from './seed';
import { logger } from './utils/logger';
import { whatsappService } from './services/whatsappService';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // 1. Connect to Database (dual-mode: external URI or in-memory fallback)
    await connectDB();

    // 2. Auto-seed demo data if database is fresh
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Bootstrap] No users found. Auto-seeding demo users...');
      logger.info('[Bootstrap] No users found. Auto-seeding demo users...');
      await seedDemoData();
    }

    // 3. Create HTTP & Socket.IO server
    const server = http.createServer(app);
    initSocketIO(server);

    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` 🚗 CampusRide Backend Server running on port ${PORT}`);
      console.log(` 📡 Socket.IO initialized for real-time events`);
      console.log(` 🔗 API Healthcheck: http://localhost:${PORT}/api/health`);
      console.log(` 🔗 API Readiness:   http://localhost:${PORT}/api/ready`);
      console.log(`====================================================`);
      logger.info(`CampusRide Backend Server running on port ${PORT}`);
      logger.info(`Socket.IO initialized for real-time events`);
      logger.info(`API Healthcheck: http://localhost:${PORT}/api/health`);
      logger.info(`API Readiness: http://localhost:${PORT}/api/ready`);

      // 4. Initialize Baileys WhatsApp OTP Bot
      whatsappService.initialize().catch((waErr) => {
        logger.warn({ waErr }, '[WhatsApp] Auto-init failed, will retry on demand');
      });
    });

    // 4. Graceful shutdown handler (§4.6)
    const shutdown = async (signal: string) => {
      console.log(`[Shutdown] Received ${signal}. Starting graceful shutdown...`);
      logger.info(`[Shutdown] Received ${signal}. Starting graceful shutdown...`);

      const forceExitTimer = setTimeout(() => {
        console.error('[Shutdown] Forced exit timeout (10s) reached. Terminating process.');
        process.exit(1);
      }, 10000);
      forceExitTimer.unref();

      server.close(async () => {
        console.log('[Shutdown] Closed HTTP and WebSocket servers.');
        try {
          await disconnectDB();
          console.log('[Shutdown] Database connection closed.');
          process.exit(0);
        } catch (dbErr) {
          console.error('[Shutdown] Error disconnecting database:', dbErr);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start CampusRide server:', err);
    logger.error({ err }, 'Failed to start CampusRide server');
    process.exit(1);
  }
}

bootstrap();
