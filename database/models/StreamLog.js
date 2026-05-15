const mongoose = require('mongoose');

const streamLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['stream', 'download'], default: 'stream' },
  duration: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now }
});

streamLogSchema.index({ song: 1, createdAt: -1 });
streamLogSchema.index({ artist: 1, createdAt: -1 });

module.exports = mongoose.model('StreamLog', streamLogSchema);