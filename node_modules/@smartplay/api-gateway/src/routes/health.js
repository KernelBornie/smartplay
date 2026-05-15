const mongoose = require('mongoose');

function healthHandler(req, res) {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting', 99: 'uninitialized' };
  const dbStatus = states[dbState] || 'unknown';
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    success: isHealthy,
    service: 'api-gateway',
    timestamp: new Date().toISOString(),
    requestId: req.requestId,
    uptime: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      connected: isHealthy,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null
    }
  });
}

module.exports = healthHandler;