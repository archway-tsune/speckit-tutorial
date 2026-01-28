require('dotenv').config();

const isTest = process.env.NODE_ENV === 'test';

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  database: {
    url: process.env.DATABASE_URL || './database/blog.db',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'development-secret-key',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  rateLimit: {
    auth: {
      max: isTest ? 1000 : (parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 5),
      windowMs: isTest ? 60000 : (parseInt(process.env.RATE_LIMIT_AUTH_WINDOW_MS, 10) || 60000),
    },
    general: {
      max: isTest ? 10000 : (parseInt(process.env.RATE_LIMIT_GENERAL_MAX, 10) || 100),
      windowMs: isTest ? 60000 : (parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW_MS, 10) || 60000),
    },
  },

  logging: {
    level: isTest ? 'error' : (process.env.LOG_LEVEL || 'info'),
  },
};

module.exports = config;
