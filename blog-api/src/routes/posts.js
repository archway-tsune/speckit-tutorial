const express = require('express');
const postController = require('../controllers/postController');
const { authenticate, optionalAuth } = require('../middlewares/auth');
const {
  validateCreatePost,
  validateUpdatePost,
  validateQueryParams,
  validateUUID,
} = require('../middlewares/validator');

const router = express.Router();

// GET /api/v1/posts - List posts (public)
router.get('/', optionalAuth, validateQueryParams, postController.getAll);

// GET /api/v1/posts/:id - Get post by ID (public for published, auth required for draft)
router.get('/:id', optionalAuth, validateUUID('id'), postController.getById);

// POST /api/v1/posts - Create post (auth required)
router.post('/', authenticate, validateCreatePost, postController.create);

// PUT /api/v1/posts/:id - Update post (auth required, owner only)
router.put('/:id', authenticate, validateUUID('id'), validateUpdatePost, postController.update);

// DELETE /api/v1/posts/:id - Delete post (auth required, owner only)
router.delete('/:id', authenticate, validateUUID('id'), postController.remove);

module.exports = router;
