const express = require('express');
const jwt = require('jsonwebtoken');
const StreamLog = require('../../../../database/models/StreamLog');
const Song = require('../../../../database/models/Song');

const router = express.Router();

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// GET /analytics/streams - admin view stream logs
router.get('/streams', authenticate, adminOnly, async (req, res, next) => {
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

// GET /analytics/top-songs - admin view top streamed songs
router.get('/top-songs', authenticate, adminOnly, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '10', 10);

    const topSongs = await Song.find({ approvalStatus: 'approved' })
      .sort({ playCount: -1 })
      .limit(limit)
      .populate('artist', 'username');

    res.json({ songs: topSongs });
  } catch (err) {
    next(err);
  }
});

// GET /analytics/summary - dashboard summary
router.get('/summary', authenticate, adminOnly, async (req, res, next) => {
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
