const authService = require('../services/authService');
const User = require('../models/User');
const { UnauthorizedError } = require('../utils/errors');

function extractToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

function authenticate(req, _res, next) {
  const token = extractToken(req);

  if (!token) {
    return next(new UnauthorizedError('認証トークンが必要です'));
  }

  try {
    const decoded = authService.verifyAccessToken(token);
    const user = User.findById(decoded.userId);

    if (!user) {
      return next(new UnauthorizedError('ユーザーが見つかりません'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
}

function optionalAuth(req, _res, next) {
  const token = extractToken(req);

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = authService.verifyAccessToken(token);
    const user = User.findById(decoded.userId);

    if (user) {
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
}

module.exports = {
  authenticate,
  optionalAuth,
};
