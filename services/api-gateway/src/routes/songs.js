const express = require('express');
const { body, query, validationResult } = require('express-validator');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const fs = require('fs');
const Song = require('../../../../database/models/Song');
const { authenticate, authorize } = require('../middleware/auth');
const { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS } = require('../../../../database/constants');

const router = express.Router();

// Multer setup for uploads
const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, '../../../../uploads');
if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_PATH),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME_TYPES.has(file.mimetype) && !ALLOWED_EXTENSIONS.has(ext)) {
      const err = new Error('Invalid file type. Only audio files are allowed.');
      err.code = 'INVALID_FILE_TYPE';
      return cb(err, false);
    }
    cb(null, true);
  },
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10) },
});

// GET /songs
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
      if (req.query.search) filter.$text = { $search: req.query.search };

      const [songs, total] = await Promise.all([
        Song.find(filter).populate('artist', 'username').skip(skip).limit(limit).sort({ createdAt: -1 }),
        Song.countDocuments(filter),
      ]);

      res.json({ songs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
    } catch (err) {
      next(err);
    }
  }
);

// GET /songs/:id
router.get('/:id', async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id).populate('artist', 'username');
    if (!song) return res.status(404).json({ error: 'Song not found' });
    if (song.approvalStatus !== 'approved') {
      return res.status(403).json({ error: 'Song is not available' });
    }
    res.json({ song });
  } catch (err) {
    next(err);
  }
});

// POST /songs/upload
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
        if (req.file) fs.unlink(req.file.path, () => {});
        return res.status(400).json({ errors: errors.array() });
      }
      if (!req.file) return res.status(400).json({ error: 'Audio file is required' });

      const { title, genre, album, duration } = req.body;
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

      res.status(201).json({ message: 'Song uploaded, pending approval', song });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
