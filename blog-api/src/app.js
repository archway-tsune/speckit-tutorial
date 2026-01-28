const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');
const { setupSwagger } = require('./docs/swagger');
const config = require('./config');

const app = express();

// Security middlewares
app.use(helmet());
app.use(cors());

// Rate limiting
app.use(generalLimiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Swagger documentation (not in test environment)
if (config.env !== 'test') {
  setupSwagger(app);
}

// API routes
app.use(routes);

// Error handling
app.use(errorHandler);

module.exports = app;
