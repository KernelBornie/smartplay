// Production entry point for Render
require('dotenv').config();

const express = require('express');
const app = express();

// Import the gateway (it already proxies everything)
const gatewayApp = require('./services/api-gateway/src/index');

// Mount the whole gateway
app.use(gatewayApp);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SmartPlay API running on port ${PORT}`);
});