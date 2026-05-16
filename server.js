require('dotenv').config();

const express = require('express');
const app = express();
const { connectDB, logger } = require('./packages/shared');

// Connect to MongoDB before starting
connectDB().then(() => {
  logger.info('Database connection established from server.js');
}).catch(err => {
  logger.error('Failed to connect to MongoDB from server.js', { error: err.message });
});

// Import and mount the gateway (it won't auto-start because of the guard)
const gatewayApp = require('./services/api-gateway/src/index');
app.use(gatewayApp);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SmartPlay API running on port ${PORT}`);
});