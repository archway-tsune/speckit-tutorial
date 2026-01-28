const { AppError, InternalError } = require('../utils/errors');
const logger = require('../utils/logger');

function errorHandler(err, req, res, _next) {
  if (err instanceof AppError) {
    logger.warn(`Operational error: ${err.code}`, {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
    });

    return res.status(err.statusCode).json(err.toJSON());
  }

  logger.error('Unexpected error', {
    message: err.message,
    stack: err.stack,
    path: req.path,
  });

  const internalError = new InternalError();
  return res.status(internalError.statusCode).json(internalError.toJSON());
}

module.exports = errorHandler;
