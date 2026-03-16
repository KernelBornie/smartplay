require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const { createClient } = require('redis');
const { RedisStore } = require('rate-limit-redis');

const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
const streamRoutes = require('./routes/stream');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 3000;

// Security + parsing middleware (order matters in Express)
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Health check (exempt from rate limiting — mounted before limiter)
app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api-gateway', ts: new Date().toISOString() });
});

async function setupRateLimit() {
  let store;
  if (process.env.REDIS_URL) {
    try {
      const redisClient = createClient({ url: process.env.REDIS_URL });
      await redisClient.connect();
      store = new RedisStore({ sendCommand: (...args) => redisClient.sendCommand(args) });
      console.log('Rate limiter using Redis store');
    } catch (err) {
      console.warn('Redis connection failed, falling back to memory store:', err.message);
    }
  }
  return rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    standardHeaders: true,
    legacyHeaders: false,
    store,
    message: { error: 'Too many requests, please try again later.' },
  });
}

async function start() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartplay');
  console.log('API Gateway connected to MongoDB');

  // Apply rate limiting BEFORE mounting any protected routes
  const limiter = await setupRateLimit();
  app.use(limiter);

  // Mount API routes (after rate limiter is registered)
  app.use('/auth', authRoutes);
  app.use('/songs', songRoutes);
  app.use('/stream', streamRoutes);
  app.use('/admin', adminRoutes);
  app.use('/analytics', analyticsRoutes);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });

  // Centralized error handler
  app.use((err, _req, res, _next) => {
    console.error(err.stack);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File too large' });
    }
    if (err.code === 'INVALID_FILE_TYPE') {
      return res.status(400).json({ error: err.message });
    }
    res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
  });

  app.listen(PORT, () => {
    console.log(`API Gateway listening on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

start().catch(console.error);

module.exports = app;
