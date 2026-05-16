require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const axios = require('axios');

const {
  requestId,
  errorHandler,
  gracefulShutdown,
  logger,
  connectDB,
  validateEnv
} = require('@smartplay/shared');

process.env.SERVICE_NAME = 'api-gateway';
validateEnv();

const app = express();

app.set('trust proxy', 1);

const PORT = process.env.PORT || 3000;

/* ---------------- SECURITY ---------------- */
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id']
}));

/* ---------------- RATE LIMIT ---------------- */
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());
app.use(requestId);

/* ---------------- LOGGING ---------------- */
app.use((req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    logger.info(`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: Date.now() - start,
      requestId: req.requestId
    });
  });

  next();
});

/* ---------------- HEALTH ---------------- */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

/* ---------------- AUTH (FIXED - NO LOCALHOST) ---------------- */
app.use('/auth', async (req, res, next) => {
  try {
    const url = `${process.env.AUTH_SERVICE_URL}${req.originalUrl.replace('/auth', '')}`;

    const response = await axios({
      method: req.method,
      url,
      data: req.body,
      headers: {
        Authorization: req.headers.authorization || '',
        'x-request-id': req.requestId
      }
    });

    res.status(response.status).json(response.data);

  } catch (err) {
    next(err);
  }
});

/* ---------------- PROXIES (PRODUCTION READY) ---------------- */
const proxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (path) => path.replace(/^\/api\/[^/]+/, ''),
    onError: (err, req, res) => {
      res.status(502).json({
        success: false,
        error: 'Service unavailable'
      });
    }
  });

app.use('/api/music', proxy(process.env.MUSIC_SERVICE_URL));
app.use('/api/stream', proxy(process.env.STREAM_SERVICE_URL));
app.use('/api/analytics', proxy(process.env.ANALYTICS_SERVICE_URL));

/* ---------------- ADMIN ---------------- */
app.use('/admin', require('./routes/admin'));

/* ---------------- ERROR HANDLER ---------------- */
app.use(errorHandler);

/* ---------------- START SERVER (ONLY ONE LISTEN - FIXED EADDRINUSE) ---------------- */
async function start() {
  await connectDB();
  logger.info('Database connected');

  app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
  });
}

if (require.main === module) {
  start();
}

module.exports = app;