const mongoose = require('mongoose');
const logger = require('../logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

let connection = null;

async function connectDB(options = {}) {
  const uri = options.uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartplay';
  const dbName = options.dbName || process.env.MONGODB_DB || 'smartplay';

  const mongooseOptions = {
    dbName,
    family: 4,
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    heartbeatFrequencyMS: 10000,
    retryWrites: true,
    w: 'majority'
  };

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      logger.info(`Connecting to MongoDB [attempt ${attempt}/${MAX_RETRIES}]`);
      connection = await mongoose.connect(uri, mongooseOptions);
      logger.info('MongoDB connected', {
        host: connection.connection.host,
        port: connection.connection.port,
        name: connection.connection.name
      });

      mongoose.connection.on('error', (err) => {
        logger.error('MongoDB connection error', { error: err.message });
      });
      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });
      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

      return connection;
    } catch (err) {
      logger.error(`Connection attempt ${attempt} failed`, { error: err.message });
      if (attempt === MAX_RETRIES) {
        logger.error('All MongoDB connection attempts exhausted');
        throw new Error(`MongoDB unreachable after ${MAX_RETRIES} attempts: ${err.message}`);
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }
}

function getConnection() {
  if (!connection || mongoose.connection.readyState !== 1) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return connection;
}

async function disconnectDB() {
  if (connection) {
    await mongoose.connection.close(false);
    logger.info('MongoDB connection closed');
  }
}

module.exports = { connectDB, getConnection, disconnectDB };