const mongoose = require('mongoose');

const songSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    artist: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    artistName: { type: String, required: true },
    genre: { type: String, default: 'Unknown' },
    duration: { type: Number, default: 0 },
    fileUrl: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number, default: 0 },
    mimeType: { type: String, default: 'audio/mpeg' },
    coverArt: { type: String, default: '' },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    uploadDate: { type: Date, default: Date.now },
    playCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    album: { type: String, default: '' },
    year: { type: Number },
  },
  { timestamps: true }
);

songSchema.index({ title: 'text', artistName: 'text', genre: 'text' });

module.exports = mongoose.model('Song', songSchema);
