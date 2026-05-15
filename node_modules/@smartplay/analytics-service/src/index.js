require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const express = require('express');
const {
  requestId, errorHandler, gracefulShutdown, logger, connectDB, validateEnv
} = require('@smartplay/shared');

process.env.SERVICE_NAME = 'analytics-service';
validateEnv();

const app = express();
const PORT = parseInt(process.env.ANALYTICS_PORT, 10) || 3004;

app.use(express.json());
app.use(requestId);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode}`, {
      requestId: req.requestId, duration: `${Date.now() - start}ms`
    });
  });
  next();
});

app.get('/health', (req, res) => {
  res.json({ success: true, service: 'analytics-service', requestId: req.requestId });
});

app.get('/streams', (req, res) => {
  res.json({ success: true, data: [], requestId: req.requestId });
});

app.get('/top-songs', (req, res) => {
  res.json({ success: true, data: [], requestId: req.requestId });
});

app.get('/summary', (req, res) => {
  res.json({
    success: true,
    data: { totalStreams: 0, totalUsers: 0, totalSongs: 0 },
    requestId: req.requestId
  });
});

app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Analytics Service started`, { port: PORT });
    });
    gracefulShutdown(server);
  } catch (err) {
    logger.error('Failed to start Analytics Service', { error: err.message });
    process.exit(1);
  }
}

start();
module.exports = app;