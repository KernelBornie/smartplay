const express = require('express');
const router = express.Router();
const { AppError, logger } = require('@smartplay/shared');
const Song = require('../../../../database/models/Song');
const User = require('../../../../database/models/User');
const StreamLog = require('../../../../database/models/StreamLog');
const jwt = require('jsonwebtoken');

function adminAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) throw AppError.unauthorized('Login required');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    if (decoded.role !== 'admin') throw AppError.forbidden('Admin only');
    req.user = decoded;
    next();
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw AppError.unauthorized('Invalid token');
  }
}

// Role‑based dashboard (used by main app and admin panel)
router.get('/dashboard', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw AppError.unauthorized('Login required');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(decoded.id).populate('plan').select('-password');
    if (!user) throw AppError.notFound('User not found');

    let dashboardData = { user };

    if (user.role === 'listener') {
      const recentStreams = await StreamLog.find({ user: user._id })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('song');
      dashboardData.recentStreams = recentStreams;
      dashboardData.plan = user.plan;
    } else if (user.role === 'artist') {
      const [mySongs, totalPlays, pendingCount] = await Promise.all([
        Song.find({ artist: user._id }).sort({ createdAt: -1 }),
        StreamLog.countDocuments({ artist: user._id, type: 'stream' }),
        Song.countDocuments({ artist: user._id, status: 'pending' })
      ]);
      dashboardData.mySongs = mySongs;
      dashboardData.totalPlays = totalPlays;
      dashboardData.totalEarnings = user.totalEarnings;
      dashboardData.pendingSongs = pendingCount;
    } else if (user.role === 'admin') {
      // Admin – full CEO dashboard
      const totalUsers = await User.countDocuments();
      const approvedSongs = await Song.countDocuments({ status: 'approved' });
      const pendingSongs = await Song.countDocuments({ status: 'pending' });
      const totalStreams = await StreamLog.countDocuments({ type: 'stream' });
      const totalDownloads = await StreamLog.countDocuments({ type: 'download' });

      const revenueData = await StreamLog.aggregate([
        { $match: { type: { $in: ['stream', 'download'] } } },
        { $group: { _id: null, totalRevenue: { $sum: '$revenue' } } }
      ]);
      const totalRevenue = revenueData[0]?.totalRevenue || 0;

      const topArtists = await StreamLog.aggregate([
        {
          $match: {
            type: 'stream',
            artist: { $exists: true, $ne: null }
          }
        },
        {
          $group: {
            _id: '$artist',
            streams: { $sum: 1 }
          }
        },
        { $sort: { streams: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'artist'
          }
        },
        {
          $unwind: {
            path: '$artist',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            artistName: { $ifNull: ['$artist.username', 'Unknown Artist'] },
            streams: 1
          }
        }
      ]);

      const genreStats = await Song.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: '$genre', count: { $sum: 1 }, totalPlays: { $sum: '$plays' } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]);

      const recentActivity = await StreamLog.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .populate('song', 'title artistName')
        .populate('user', 'username')
        .lean();

      dashboardData.stats = {
        totalUsers,
        approvedSongs,
        pendingSongs,
        totalStreams,
        totalDownloads,
        totalRevenue
      };
      dashboardData.topArtists = topArtists;
      dashboardData.genreStats = genreStats;
      dashboardData.recentActivity = recentActivity;
      dashboardData.allUsers = await User.find().select('-password');
    }

    res.json({ success: true, data: dashboardData, requestId: req.requestId });
  } catch (err) {
    next(err);
  }
});

// Admin: edit user
router.put('/users/:id', adminAuth, async (req, res, next) => {
  try {
    const updates = {};
    const allowed = ['username', 'email', 'role', 'frozen', 'plan', 'planExpiresAt'];
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) throw AppError.notFound('User not found');
    logger.info(`Admin updated user ${user._id}`);
    res.json({ success: true, data: user, requestId: req.requestId });
  } catch (err) {
    next(err);
  }
});

// Admin: freeze/unfreeze user
router.post('/users/:id/freeze', adminAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw AppError.notFound('User not found');
    user.frozen = !user.frozen;
    await user.save();
    logger.info(`User ${user._id} ${user.frozen ? 'frozen' : 'unfrozen'}`);
    res.json({ success: true, data: user, requestId: req.requestId });
  } catch (err) {
    next(err);
  }
});

// Stats (quick view)
router.get('/stats', async (req, res, next) => {
  try {
    const [totalUsers, totalSongs, pendingSongs, streams] = await Promise.all([
      User.countDocuments(),
      Song.countDocuments({ status: 'approved' }),
      Song.countDocuments({ status: 'pending' }),
      StreamLog.countDocuments()
    ]);
    res.json({ success: true, data: { totalUsers, totalSongs, totalPlays: streams, pendingSongs }, requestId: req.requestId });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
});

router.get('/users', adminAuth, async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users, requestId: req.requestId });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
});

router.get('/songs', adminAuth, async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const songs = await Song.find(query).populate('artist', 'username email').sort({ createdAt: -1 });
    res.json({ success: true, data: songs, requestId: req.requestId });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
});

router.post('/approve-song', adminAuth, async (req, res, next) => {
  try {
    const { songId } = req.body;
    const song = await Song.findByIdAndUpdate(songId, { status: 'approved' }, { new: true });
    if (!song) throw AppError.notFound('Song not found');
    logger.info('Song approved', { songId });
    res.json({ success: true, data: song, requestId: req.requestId });
  } catch (err) { next(err); }
});

router.post('/reject-song', adminAuth, async (req, res, next) => {
  try {
    const { songId } = req.body;
    const song = await Song.findByIdAndUpdate(songId, { status: 'rejected' }, { new: true });
    if (!song) throw AppError.notFound('Song not found');
    logger.info('Song rejected', { songId });
    res.json({ success: true, data: song, requestId: req.requestId });
  } catch (err) { next(err); }
});

router.delete('/songs/:id', adminAuth, async (req, res, next) => {
  try {
    const song = await Song.findByIdAndDelete(req.params.id);
    if (!song) throw AppError.notFound('Song not found');
    logger.info('Song deleted', { songId: req.params.id });
    res.json({ success: true, message: 'Song deleted', requestId: req.requestId });
  } catch (err) { next(err); }
});

module.exports = router;