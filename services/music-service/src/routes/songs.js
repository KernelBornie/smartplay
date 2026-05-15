const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { AppError, logger } = require('@smartplay/shared');
const upload = require('../middleware/upload');
const Song = require('../../../../database/models/Song');
const StreamLog = require('../../../../database/models/StreamLog');
const User = require('../../../../database/models/User');
const jwt = require('jsonwebtoken');

const STREAM_RATE = 0.004;
const DOWNLOAD_RATE = 0.50;

// CORS preflight for stream/download routes
router.options('/stream/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'range, x-request-id, authorization');
  res.sendStatus(204);
});

router.options('/download/:id', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'range, x-request-id, authorization');
  res.sendStatus(204);
});

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
  } catch (e) {}
  next();
}

router.use(authMiddleware);

// ─── SPECIFIC ROUTES (must be before /:id) ──────────────────

// GET /songs/trending
router.get('/trending', async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const songs = await Song.find({ status: 'approved' })
      .sort({ plays: -1, createdAt: -1 })
      .limit(limit);
    res.json({ success: true, data: songs });
  } catch (err) {
    next(err);
  }
});

// GET /songs/search
router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ success: true, data: [] });
    const regex = new RegExp(q, 'i');
    const songs = await Song.find({
      status: 'approved',
      $or: [
        { title: regex },
        { artistName: regex },
        { genre: regex }
      ]
    }).limit(20);
    res.json({ success: true, data: songs });
  } catch (err) {
    next(err);
  }
});

// GET /songs/charts
router.get('/charts', async (req, res, next) => {
  try {
    const songs = await Song.find({ status: 'approved' })
      .sort({ plays: -1 })
      .limit(50);
    res.json({ success: true, data: songs });
  } catch (err) {
    next(err);
  }
});

// GET /songs/stream/:id
router.get('/stream/:id', async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song || song.status !== 'approved') throw AppError.notFound('Song not found');

    const filePath = path.resolve(__dirname, '../../../../', song.fileUrl.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) throw AppError.notFound('Audio file not found');

    song.plays += 1;
    song.revenue += STREAM_RATE;
    await song.save();

    await StreamLog.create({
      user: req.user?.id,
      song: song._id,
      artist: song.artist,
      type: 'stream',
      revenue: STREAM_RATE,
      ip: req.ip
    });

    await User.findByIdAndUpdate(song.artist, {
      $inc: { totalStreams: 1, totalEarnings: STREAM_RATE }
    });

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-cache');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Content-Length': chunksize
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
});

// GET /songs/download/:id
router.get('/download/:id', async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song || song.status !== 'approved') throw AppError.notFound('Song not found');

    const filePath = path.resolve(__dirname, '../../../../', song.fileUrl.replace(/^\//, ''));
    if (!fs.existsSync(filePath)) throw AppError.notFound('Audio file not found');

    song.downloads += 1;
    song.revenue += DOWNLOAD_RATE;
    await song.save();

    await StreamLog.create({
      user: req.user?.id,
      song: song._id,
      artist: song.artist,
      type: 'download',
      revenue: DOWNLOAD_RATE,
      ip: req.ip
    });

    await User.findByIdAndUpdate(song.artist, {
      $inc: { totalDownloads: 1, totalEarnings: DOWNLOAD_RATE }
    });

    res.download(filePath, `${song.title}.mp3`);
  } catch (err) {
    next(err);
  }
});

// ─── GENERAL ROUTES ──────────────────────────────

// GET /songs — list approved songs
router.get('/', async (req, res, next) => {
  try {
    const { page = 1, limit = 20, genre, search } = req.query;
    const query = { status: 'approved' };
    if (genre) query.genre = genre;
    if (search) query.title = { $regex: search, $options: 'i' };

    const [songs, total] = await Promise.all([
      Song.find(query).populate('artist', 'username').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(parseInt(limit)),
      Song.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: songs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total },
      requestId: req.requestId
    });
  } catch (err) {
    next(new AppError(err.message, 500));
  }
});

// GET /songs/:id (must be last among GET routes)
router.get('/:id', async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.id).populate('artist', 'username email');
    if (!song) throw AppError.notFound('Song not found');
    if (song.status !== 'approved' && (!req.user || req.user.role !== 'admin')) {
      throw AppError.notFound('Song not found');
    }
    res.json({ success: true, data: song, requestId: req.requestId });
  } catch (err) {
    next(err);
  }
});

// POST /songs/upload
router.post('/upload', upload, async (req, res, next) => {
  try {
    if (!req.user) throw AppError.unauthorized('Please login to upload');
    const { title, genre, album } = req.body;
    if (!title) throw AppError.badRequest('Title is required');
    if (!req.files || !req.files['file'] || !req.files['file'][0]) {
      throw AppError.badRequest('Audio file is required');
    }

    const dbUser = await User.findById(req.user.id).select('username');
    const artistName = dbUser ? dbUser.username : 'Unknown Artist';

    const audioFile = req.files['file'][0];
    const coverFile = req.files['cover'] ? req.files['cover'][0] : null;
    const coverImage = coverFile ? `/uploads/covers/${coverFile.filename}` : (req.body.coverUrl || '');

    const song = await Song.create({
      title,
      artist: req.user.id,
      artistName,
      genre: genre || 'other',
      album: album || '',
      fileUrl: `/uploads/${audioFile.filename}`,
      coverImage,
      duration: req.body.duration || 0
    });

    logger.info('Song uploaded', { requestId: req.requestId, songId: song._id, userId: req.user.id });

    res.status(201).json({
      success: true,
      message: 'Song uploaded and pending approval',
      data: song,
      requestId: req.requestId
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;