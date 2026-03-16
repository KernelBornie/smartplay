const express = require('express');
const Song = require('../../../../database/models/Song');
const User = require('../../../../database/models/User');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// POST /admin/approve-song
router.post(
  '/approve-song',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const { songId } = req.body;
      if (!songId) return res.status(400).json({ error: 'songId is required' });

      const song = await Song.findByIdAndUpdate(
        songId,
        { approvalStatus: 'approved' },
        { new: true }
      );
      if (!song) return res.status(404).json({ error: 'Song not found' });

      res.json({ message: 'Song approved', song });
    } catch (err) {
      next(err);
    }
  }
);

// POST /admin/reject-song
router.post(
  '/reject-song',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const { songId } = req.body;
      if (!songId) return res.status(400).json({ error: 'songId is required' });

      const song = await Song.findByIdAndUpdate(
        songId,
        { approvalStatus: 'rejected' },
        { new: true }
      );
      if (!song) return res.status(404).json({ error: 'Song not found' });

      res.json({ message: 'Song rejected', song });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /admin/songs/:id
router.delete(
  '/songs/:id',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const song = await Song.findByIdAndDelete(req.params.id);
      if (!song) return res.status(404).json({ error: 'Song not found' });
      res.json({ message: 'Song deleted' });
    } catch (err) {
      next(err);
    }
  }
);

// GET /admin/songs - list all songs (any status)
router.get(
  '/songs',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const skip = (page - 1) * limit;
      const statusFilter = req.query.status ? { approvalStatus: req.query.status } : {};

      const [songs, total] = await Promise.all([
        Song.find(statusFilter).populate('artist', 'username email').skip(skip).limit(limit).sort({ createdAt: -1 }),
        Song.countDocuments(statusFilter),
      ]);

      res.json({ songs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
      next(err);
    }
  }
);

// POST /admin/ban-user
router.post(
  '/ban-user',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ error: 'userId is required' });

      const user = await User.findByIdAndUpdate(userId, { isBanned: true }, { new: true });
      if (!user) return res.status(404).json({ error: 'User not found' });

      res.json({ message: 'User banned', userId: user._id });
    } catch (err) {
      next(err);
    }
  }
);

// GET /admin/users
router.get(
  '/users',
  authenticate,
  authorize('admin'),
  async (req, res, next) => {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        User.find().select('-password').skip(skip).limit(limit).sort({ createdAt: -1 }),
        User.countDocuments(),
      ]);

      res.json({ users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
