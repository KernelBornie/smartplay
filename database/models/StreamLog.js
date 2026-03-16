const mongoose = require('mongoose');

const streamLogSchema = new mongoose.Schema(
  {
    song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    bytesStreamed: { type: Number, default: 0 },
    duration: { type: Number, default: 0 },
    completedAt: { type: Date, default: Date.now },
    rangeRequest: { type: Boolean, default: false },
  },
  { timestamps: true }
);

streamLogSchema.index({ song: 1, createdAt: -1 });
streamLogSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('StreamLog', streamLogSchema);
