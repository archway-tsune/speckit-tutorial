const rateLimit = require('express-rate-limit');
const config = require('../config');
const { RateLimitError } = require('../utils/errors');

const authLimiter = rateLimit({
  windowMs: config.rateLimit.auth.windowMs,
  max: config.rateLimit.auth.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    const error = new RateLimitError();
    res.status(error.statusCode).json(error.toJSON());
  },
});

const generalLimiter = rateLimit({
  windowMs: config.rateLimit.general.windowMs,
  max: config.rateLimit.general.max,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res, _next) => {
    const error = new RateLimitError();
    res.status(error.statusCode).json(error.toJSON());
  },
});

module.exports = {
  authLimiter,
  generalLimiter,
};
