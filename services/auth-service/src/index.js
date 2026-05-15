require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const express = require('express');
const cors = require('cors');
const {
  requestId, errorHandler, gracefulShutdown, logger, connectDB, validateEnv
} = require('@smartplay/shared');

process.env.SERVICE_NAME = 'auth-service';
validateEnv();

const app = express();
const PORT = parseInt(process.env.AUTH_PORT, 10) || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
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
  res.json({ success: true, service: 'auth-service', requestId: req.requestId });
});

app.use('/', require('./routes/auth'));
app.use(errorHandler);

async function start() {
  try {
    await connectDB();
    const server = app.listen(PORT, () => {
      logger.info(`Auth Service started`, { port: PORT });
    });
    gracefulShutdown(server);
  } catch (err) {
    logger.error('Failed to start Auth Service', { error: err.message });
    process.exit(1);
  }
}

start();
module.exports = app;