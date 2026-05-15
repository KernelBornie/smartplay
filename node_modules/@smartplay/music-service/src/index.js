require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const express = require('express');
const {
  requestId, errorHandler, gracefulShutdown, logger, connectDB, validateEnv
} = require('@smartplay/shared');

process.env.SERVICE_NAME = 'music-service';
validateEnv();

const app = express();
const PORT = parseInt(process.env.MUSIC_PORT, 10) || 3002;

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
  res.json({ success: true, service: 'music-service', requestId: req.requestId });
});

app.use('/songs', require('./routes/songs'));
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Music Service started`, { port: PORT });
    });
    gracefulShutdown(server);
  } catch (err) {
    logger.error('Failed to start Music Service', { error: err.message });
    process.exit(1);
  }
}

start();
module.exports = app;