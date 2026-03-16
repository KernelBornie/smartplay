const express = require('express');
const { body, query, validationResult } = require('express-validator');
const path = require('path');
const Song = require('../../../../database/models/Song');
const upload = require('../middleware/upload');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /songs - list approved songs
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('genre').optional().trim(),
    query('search').optional().trim(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const page = parseInt(req.query.page || '1', 10);
      const limit = parseInt(req.query.limit || '20', 10);
      const skip = (page - 1) * limit;

      const filter = { approvalStatus: 'approved' };
      if (req.query.genre) filter.genre = { $regex: req.query.genre, $options: 'i' };
      if (req.query.search) {
        filter.$text = { $search: req.query.search };
      }

      const [songs, total] = await Promise.all([
        Song.find(filter)
          .populate('artist', 'username email')
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 }),
        Song.countDocuments(filter),
      ]);

      res.json({
        songs,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /songs/:id - get single song
router.get('/:id', async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id).populate('artist', 'username email');
    if (!song) return res.status(404).json({ error: 'Song not found' });
    if (song.approvalStatus !== 'approved') {
      return res.status(403).json({ error: 'Song is not available' });
    }
    res.json({ song });
  } catch (err) {
    next(err);
  }
});

// POST /songs/upload - artist uploads a song
router.post(
  '/upload',
  authenticate,
  authorize('artist', 'admin'),
  upload.single('file'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('genre').optional().trim(),
    body('album').optional().trim(),
    body('duration').optional().isNumeric(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        if (req.file) {
          const fs = require('fs');
          fs.unlink(req.file.path, () => {});
        }
        return res.status(400).json({ errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Audio file is required' });
      }

      const { title, genre, album, duration } = req.body;
      const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, '../../../../uploads');
      const fileUrl = `/files/${req.file.filename}`;

      const song = await Song.create({
        title,
        artist: req.user.userId,
        artistName: req.user.username || 'Unknown',
        genre: genre || 'Unknown',
        album: album || '',
        duration: duration ? parseFloat(duration) : 0,
        fileUrl,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        approvalStatus: 'pending',
      });

      res.status(201).json({
        message: 'Song uploaded successfully, pending approval',
        song,
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
