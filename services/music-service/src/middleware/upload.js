const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS } = require('../../../../../database/constants');

const UPLOAD_PATH = process.env.UPLOAD_PATH || path.join(__dirname, '../../../../../uploads');

if (!fs.existsSync(UPLOAD_PATH)) {
  fs.mkdirSync(UPLOAD_PATH, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_PATH),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(file.mimetype) && !ALLOWED_EXTENSIONS.has(ext)) {
    const err = new Error('Invalid file type. Only audio files are allowed.');
    err.code = 'INVALID_FILE_TYPE';
    return cb(err, false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800', 10) },
});

module.exports = upload;
