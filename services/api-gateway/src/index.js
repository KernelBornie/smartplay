require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const { createProxyMiddleware } = require('http-proxy-middleware');
const {
  requestId, errorHandler, gracefulShutdown, logger, connectDB, validateEnv
} = require('@smartplay/shared');

process.env.SERVICE_NAME = 'api-gateway';
validateEnv();

const app = express();

app.set('trust proxy', 1);

const PORT = parseInt(process.env.PORT, 10) || 3000;

// ═══════════════ SECURITY ═══════════════
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));

// ═══════════════ CORS – allows Vercel + local dev ═══════════════
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (origin.endsWith('.vercel.app')) return callback(null, true);
    if (origin.match(/^https?:\/\/localhost(:\d+)?$/)) return callback(null, true);
    callback(new Error('Blocked by CORS: ' + origin));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id', 'x-correlation-id'],
  credentials: true
}));

// Handle preflight for all routes
app.options('*', cors());

// ═══════════════ RATE LIMITING ═══════════════
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

// ═══════════════ REQUEST ID + LOGGING ═══════════════
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

// ═══════════════ HEALTH ═══════════════
app.get('/health', require('./routes/health'));

// ═══════════════ BODY PARSING ═══════════════
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// ═══════════════ AUTH – direct HTTP handler ═══════════════
const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

app.use('/auth', authLimiter, async (req, res, next) => {
  try {
    const url = AUTH_SERVICE + req.originalUrl.replace('/auth', '');
    const response = await axios({
      method: req.method,
      url: url,
      data: req.body,
      headers: {
        'Content-Type': 'application/json',
        'x-request-id': req.requestId,
        'Authorization': req.headers.authorization || ''
      },
      timeout: 30000
    });
    res.status(response.status).json(response.data);
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ECONNABORTED') {
      return res.status(502).json({
        success: false,
        error: { message: 'Service temporarily unavailable', code: 'SERVICE_DOWN' },
        requestId: req.requestId
      });
    }
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    logger.error('Auth handler error', { error: err.message });
    next(err);
  }
});

// ═══════════════ SERVICE PROXIES ═══════════════
app.use('/api/music', createProxyMiddleware({
  target: process.env.MUSIC_SERVICE_URL || 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/api/music': '' },
  proxyTimeout: 30000, timeout: 30000,
  on: {
    proxyReq: (proxyReq, req) => { if (req.requestId) proxyReq.setHeader('x-request-id', req.requestId); },
    error: (err, req, res) => {
      if (!res.headersSent) res.status(502).json({ success: false, error: { message: 'Music service unavailable' } });
    }
  }
}));

app.use('/api/stream', createProxyMiddleware({
  target: process.env.STREAM_SERVICE_URL || 'http://localhost:3003',
  changeOrigin: true,
  pathRewrite: { '^/api/stream': '' },
  proxyTimeout: 30000, timeout: 30000,
  on: {
    proxyReq: (proxyReq, req) => { if (req.requestId) proxyReq.setHeader('x-request-id', req.requestId); },
    error: (err, req, res) => {
      if (!res.headersSent) res.status(502).json({ success: false, error: { message: 'Stream service unavailable' } });
    }
  }
}));

app.use('/api/analytics', createProxyMiddleware({
  target: process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004',
  changeOrigin: true,
  pathRewrite: { '^/api/analytics': '' },
  proxyTimeout: 30000, timeout: 30000,
  on: {
    proxyReq: (proxyReq, req) => { if (req.requestId) proxyReq.setHeader('x-request-id', req.requestId); },
    error: (err, req, res) => {
      if (!res.headersSent) res.status(502).json({ success: false, error: { message: 'Analytics service unavailable' } });
    }
  }
}));

// ═══════════════ ADMIN ROUTES ═══════════════
app.use('/admin', require('./routes/admin'));

// ═══════════════ ERROR HANDLER ═══════════════
app.use(errorHandler);

// ═══════════════ START ═══════════════
async function start() {
  try {
    await connectDB();
    logger.info('Database connection established');
    const server = app.listen(PORT, '0.0.0.0', () => {
      logger.info(`API Gateway started`, { port: PORT, env: process.env.NODE_ENV });
    });
    gracefulShutdown(server, { timeout: 15000 });
  } catch (err) {
    logger.error('Failed to start API Gateway', { error: err.message, stack: err.stack });
    process.exit(1);
  }
}

// Only auto‑start when run directly (not when imported by server.js)
if (require.main === module) {
  start();
}

module.exports = app;