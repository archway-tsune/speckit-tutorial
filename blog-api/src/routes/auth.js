const express = require('express');
const authController = require('../controllers/authController');
const { validateRegister, validateLogin, validateRefresh } = require('../middlewares/validator');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

// Apply rate limiting to all auth routes
router.use(authLimiter);

// POST /api/v1/auth/register
router.post('/register', validateRegister, authController.register);

// POST /api/v1/auth/login
router.post('/login', validateLogin, authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', validateRefresh, authController.refresh);

// POST /api/v1/auth/logout
router.post('/logout', validateRefresh, authController.logout);

module.exports = router;
