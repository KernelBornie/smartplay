const express = require('express');
const StreamLog = require('../../../../database/models/StreamLog');
const Song = require('../../../../database/models/Song');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /analytics/streams
router.get('/streams', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      StreamLog.find()
        .populate('song', 'title artistName')
        .populate('user', 'username email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      StreamLog.countDocuments(),
    ]);

    res.json({ logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) {
    next(err);
  }
});

// GET /analytics/top-songs
router.get('/top-songs', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);
    const songs = await Song.find({ approvalStatus: 'approved' })
      .sort({ playCount: -1 })
      .limit(limit)
      .populate('artist', 'username');
    res.json({ songs });
  } catch (err) {
    next(err);
  }
});

// GET /analytics/summary
router.get('/summary', authenticate, authorize('admin'), async (req, res, next) => {
  try {
    const [totalStreams, totalSongs, approvedSongs, pendingSongs] = await Promise.all([
      StreamLog.countDocuments(),
      Song.countDocuments(),
      Song.countDocuments({ approvalStatus: 'approved' }),
      Song.countDocuments({ approvalStatus: 'pending' }),
    ]);
    res.json({ totalStreams, totalSongs, approvedSongs, pendingSongs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
