const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, enum: ['free', 'premium'] },
  price: { type: Number, default: 0 },
  features: {
    streamingQuality: { type: String, default: '128kbps' },
    downloadEnabled: { type: Boolean, default: false },
    uploadLimit: { type: Number, default: 0 },
    adFree: { type: Boolean, default: false },
    offlineMode: { type: Boolean, default: false },
    analyticsAccess: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Plan', planSchema);