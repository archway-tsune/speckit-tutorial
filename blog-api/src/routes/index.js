const express = require('express');
const authRoutes = require('./auth');
const postRoutes = require('./posts');

const router = express.Router();

// API v1 routes
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/posts', postRoutes);

module.exports = router;
