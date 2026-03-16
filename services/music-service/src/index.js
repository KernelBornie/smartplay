require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const songRoutes = require('./routes/songs');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.MUSIC_SERVICE_PORT || 3002;
const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, '../../../uploads');

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*' }));
app.use(express.json());
app.use(morgan('combined'));

// Serve uploaded files statically
app.use('/files', express.static(UPLOAD_PATH));

app.use('/songs', songRoutes);
app.use('/admin', adminRoutes);

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'music-service', ts: new Date().toISOString() });
});

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

async function start() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smartplay');
  console.log('Music service connected to MongoDB');
  app.listen(PORT, () => console.log(`Music service listening on port ${PORT}`));
}

start().catch(console.error);

module.exports = app;
