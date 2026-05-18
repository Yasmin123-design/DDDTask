import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './api/app.js';
import { connectMongoDB } from './infrastructure/database/mongodb.connection.js';
import { connectKafka, disconnectKafka } from './infrastructure/messaging/kafka.client.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

async function bootstrap() {
  let server = null;

  try {
    console.log('[Bootstrap] Starting system initialization...');

    await connectMongoDB();


    if (process.env.KAFKA_BROKERS !== 'skip') {
      await connectKafka();
    } else {
      console.log('[Bootstrap] Kafka integration skipped via environment configuration');
    }

    server = app.listen(PORT, () => {
      console.log(`[Bootstrap] HTTP API Server is running on http://localhost:${PORT}`);
    });

    const shutdownHandler = async (signal) => {
      console.log(`\n[Shutdown] Received ${signal}. Starting graceful shutdown...`);
      
      if (server) {
        server.close(() => {
          console.log('[Shutdown] HTTP API Server closed');
        });
      }

      if (process.env.KAFKA_BROKERS !== 'skip') {
        await disconnectKafka();
      }

      try {
        await mongoose.connection.close();
        console.log('[Shutdown] MongoDB connection closed');
      } catch (err) {
        console.error('[Shutdown] Error closing MongoDB connection:', err);
      }

      console.log('[Shutdown] Graceful shutdown completed. Exiting.');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdownHandler('SIGINT'));
    process.on('SIGTERM', () => shutdownHandler('SIGTERM'));

  } catch (error) {
    console.error('[Bootstrap] Critical failure during startup:', error);
    process.exit(1);
  }
}

bootstrap();
