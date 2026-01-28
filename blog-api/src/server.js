const app = require('./app');
const config = require('./config');
const logger = require('./utils/logger');
const { getDatabase, closeDatabase } = require('./config/database');
const { runMigrations } = require('../database/migrate');

let server;

async function startServer() {
  try {
    // Initialize database
    getDatabase();

    // Run migrations
    runMigrations();

    server = app.listen(config.port, () => {
      logger.info(`Server started on port ${config.port}`, {
        env: config.env,
        port: config.port,
      });
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);

      server.close(() => {
        logger.info('HTTP server closed');
        closeDatabase();
        logger.info('Database connection closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

startServer();

module.exports = server;
