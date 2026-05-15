const logger = require('../logger');
const AppError = require('../errors/AppError');

function errorHandler(err, req, res, _next) {
  const requestId = req.requestId || 'unknown';

  if (err instanceof AppError) {
    logger.warn('Handled error', {
      requestId, statusCode: err.statusCode, message: err.message, code: err.code, path: req.originalUrl
    });
    return res.status(err.statusCode).json({
      success: false,
      error: { message: err.message, code: err.code || 'APP_ERROR' },
      requestId
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: { message: 'Validation failed', details: Object.values(err.errors).map(e => e.message) },
      requestId
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      error: { message: `Duplicate value for ${field}`, code: 'DUPLICATE_KEY' },
      requestId
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: { message: `Invalid ${err.path}: ${err.value}`, code: 'INVALID_ID' },
      requestId
    });
  }

  logger.error('Unhandled error', {
    requestId, error: err.message, stack: err.stack, path: req.originalUrl, method: req.method
  });

  const isProduction = process.env.NODE_ENV === 'production';
  res.status(500).json({
    success: false,
    error: { message: isProduction ? 'Internal server error' : err.message, code: 'INTERNAL_ERROR' },
    requestId
  });
}

module.exports = errorHandler;