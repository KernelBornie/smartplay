const express = require('express');
const fs = require('fs');
const Song = require('../../../../database/models/Song');
const StreamLog = require('../../../../database/models/StreamLog');

const router = express.Router();

// GET /stream/:songId
router.get('/:songId', async (req, res, next) => {
  try {
    const song = await Song.findById(req.params.songId);
    if (!song) return res.status(404).json({ error: 'Song not found' });
    if (song.approvalStatus !== 'approved') {
      return res.status(403).json({ error: 'Song is not available for streaming' });
    }

    const filePath = song.filePath;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Audio file not found on server' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const mimeType = song.mimeType || 'audio/mpeg';
    const rangeHeader = req.headers.range;

    Song.findByIdAndUpdate(song._id, { $inc: { playCount: 1 } }).catch(() => {});

    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize || start > end) {
        return res
          .status(416)
          .header('Content-Range', `bytes */${fileSize}`)
          .json({ error: 'Range Not Satisfiable' });
      }

      const chunkSize = end - start + 1;

      StreamLog.create({
        song: song._id,
        user: req.user ? req.user.userId : null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        rangeRequest: true,
        bytesStreamed: chunkSize,
      }).catch(() => {});

      const fileStream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': mimeType,
      });
      fileStream.pipe(res);
    } else {
      StreamLog.create({
        song: song._id,
        user: req.user ? req.user.userId : null,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] || '',
        rangeRequest: false,
        bytesStreamed: fileSize,
      }).catch(() => {});

      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (err) {
    next(err);
  }
});

module.exports = router;
