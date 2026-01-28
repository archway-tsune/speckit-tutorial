const request = require('supertest');
const express = require('express');
const rateLimit = require('express-rate-limit');
const { RateLimitError } = require('../../src/utils/errors');
const errorHandler = require('../../src/middlewares/errorHandler');

// Create a test-specific app with strict rate limiting
function createTestApp() {
  const app = express();
  app.use(express.json());

  // Apply strict rate limiter (5 requests per minute)
  const strictLimiter = rateLimit({
    windowMs: 60000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res, _next) => {
      const error = new RateLimitError();
      res.status(error.statusCode).json(error.toJSON());
    },
  });

  app.post('/test-rate-limit', strictLimiter, (_req, res) => {
    res.json({ success: true });
  });

  app.use(errorHandler);

  return app;
}

describe('Rate Limiting', () => {
  it('should return 429 after exceeding rate limit', async () => {
    const testApp = createTestApp();

    // Make requests up to and beyond the rate limit (5 requests per minute)
    const requests = [];
    for (let i = 0; i < 7; i++) {
      requests.push(
        request(testApp)
          .post('/test-rate-limit')
          .send({})
      );
    }

    const responses = await Promise.all(requests);

    // At least one response should be rate limited
    const rateLimited = responses.filter(r => r.status === 429);
    expect(rateLimited.length).toBeGreaterThan(0);

    // The rate limited response should have the correct error format
    const limitedResponse = rateLimited[0];
    expect(limitedResponse.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
  });

  it('should allow requests within the rate limit', async () => {
    const testApp = createTestApp();

    // Make exactly 5 requests (within limit)
    const requests = [];
    for (let i = 0; i < 5; i++) {
      requests.push(
        request(testApp)
          .post('/test-rate-limit')
          .send({})
      );
    }

    const responses = await Promise.all(requests);

    // All should succeed
    const successful = responses.filter(r => r.status === 200);
    expect(successful.length).toBe(5);
  });
});
