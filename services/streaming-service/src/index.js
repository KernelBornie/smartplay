require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const express = require('express');
const {
  requestId, errorHandler, gracefulShutdown, logger, connectDB, validateEnv
} = require('@smartplay/shared');

process.env.SERVICE_NAME = 'streaming-service';
validateEnv();

const app = express();
const PORT = parseInt(process.env.STREAM_PORT, 10) || 3003;

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
  res.json({ success: true, service: 'streaming-service', requestId: req.requestId });
});

app.get('/:songId', (req, res) => {
  res.json({ success: true, message: 'Streaming endpoint', songId: req.params.songId, requestId: req.requestId });
});

app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Streaming Service started`, { port: PORT });
    });
    gracefulShutdown(server);
  } catch (err) {
    logger.error('Failed to start Streaming Service', { error: err.message });
    process.exit(1);
  }
}

start();
module.exports = app;