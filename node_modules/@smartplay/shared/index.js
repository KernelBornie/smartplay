const logger = require('./logger');
const { connectDB, getConnection, disconnectDB } = require('./database/connection');
const constants = require('./database/constants');
const AppError = require('./errors/AppError');
const errorHandler = require('./middleware/errorHandler');
const requestId = require('./middleware/requestId');
const gracefulShutdown = require('./middleware/gracefulShutdown');
const { validateEnv } = require('./utils/envValidator');

module.exports = {
  logger,
  connectDB,
  getConnection,
  disconnectDB,
  constants,
  AppError,
  errorHandler,
  requestId,
  gracefulShutdown,
  validateEnv
};