const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  artistName: { type: String },
  genre: { type: String, default: 'other' },
  album: { type: String },
  duration: { type: Number, default: 0 },
  fileUrl: { type: String, required: true },
  coverImage: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  plays: { type: Number, default: 0 },
  downloads: { type: Number, default: 0 },
  revenue: { type: Number, default: 0 },
  price: { type: Number, default: 0.99 },
  streamPrice: { type: Number, default: 0.004 },
  createdAt: { type: Date, default: Date.now }
});

songSchema.index({ status: 1, genre: 1 });
songSchema.index({ artist: 1 });

module.exports = mongoose.model('Song', songSchema);