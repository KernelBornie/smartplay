require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.AUTH_SERVICE_PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }));
app.use(express.json());
app.use(morgan('combined'));

app.use('/auth', authRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'auth-service', ts: new Date().toISOString() });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

async function start() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartplay');
  console.log('Auth service connected to MongoDB');
  app.listen(PORT, () => console.log(`Auth service listening on port ${PORT}`));
}

start().catch(console.error);

module.exports = app;
