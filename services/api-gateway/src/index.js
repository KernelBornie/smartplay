require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { createProxyMiddleware } = require('http-proxy-middleware');
const {
  requestId, errorHandler, gracefulShutdown, logger, connectDB, validateEnv
} = require('@smartplay/shared');

process.env.SERVICE_NAME = 'api-gateway';
validateEnv();

const app = express();

app.set('trust proxy', 1);

const PORT = parseInt(process.env.PORT, 10) || 3000;

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://smartplay.vercel.app',
    'https://smartplay-admin.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-correlation-id']
}));

const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests', code: 'RATE_LIMIT' } }
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 900000,
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many auth attempts', code: 'AUTH_RATE_LIMIT' } }
});

app.use(requestId);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';
    logger[level](`${req.method} ${req.originalUrl} ${res.statusCode}`, {
      requestId: req.requestId, method: req.method, path: req.originalUrl,
      statusCode: res.statusCode, duration: `${duration}ms`, ip: req.ip
    });
  });
  next();
});

app.get('/health', require('./routes/health'));

app.use('/auth', authLimiter, createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/auth': '' },
  proxyTimeout: 30000,
  timeout: 30000,
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.requestId) proxyReq.setHeader('x-request-id', req.requestId);
    },
    error: (err, req, res) => {
      logger.error('Auth proxy error', { error: err.message, path: req.originalUrl });
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          error: { message: 'Service temporarily unavailable', code: 'SERVICE_DOWN' },
          requestId: req.requestId
        });
      }
    }
  }
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/music', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/music': '' },
  proxyTimeout: 30000,
  timeout: 30000,
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.requestId) proxyReq.setHeader('x-request-id', req.requestId);
    },
    error: (err, req, res) => {
      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          error: { message: 'Service temporarily unavailable', code: 'SERVICE_DOWN' },
          requestId: req.requestId
        });
      }
    }
  }
}));

app.use('/api/stream', createProxyMiddleware({
  target: 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: { '^/api/stream': '' },
  proxyTimeout: 30000,
  timeout: 30000,
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.requestId) proxyReq.setHeader('x-request-id', req.requestId);
    },
    error: (err, req, res) => {
      if (!res.headersSent) {
        res.status(502).json({ success: false, error: { message: 'Service temporarily unavailable' } });
      }
    }
  }
}));

app.use('/api/analytics', createProxyMiddleware({
  target: 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: { '^/api/analytics': '' },
  proxyTimeout: 30000,
  timeout: 30000,
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.requestId) proxyReq.setHeader('x-request-id', req.requestId);
    },
    error: (err, req, res) => {
      if (!res.headersSent) {
        res.status(502).json({ success: false, error: { message: 'Service temporarily unavailable' } });
      }
    }
  }
}));

app.use('/admin', require('./routes/admin'));
app.use(errorHandler);

// ── Start server ──
async function start() {
  try {
    await connectDB();
    logger.info('Database connection established');
    const server = app.listen(PORT, () => {
      logger.info(`API Gateway started`, { port: PORT, env: process.env.NODE_ENV });
    });
    gracefulShutdown(server, { timeout: 15000 });
  } catch (err) {
    logger.error('Failed to start API Gateway', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}

module.exports = app;