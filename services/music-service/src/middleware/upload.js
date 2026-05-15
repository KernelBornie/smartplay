const multer = require('multer');
const path = require('path');
const { constants, AppError } = require('@smartplay/shared');
const { UPLOAD_LIMITS } = constants;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'cover') {
      cb(null, path.resolve(__dirname, '../../../../uploads/covers'));
    } else {
      cb(null, path.resolve(__dirname, '../../../../uploads'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  if (file.fieldname === 'cover') {
    const allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError(`Image format .${ext} not allowed`, 415, 'INVALID_IMAGE'), false);
    }
  } else {
    if (UPLOAD_LIMITS.ALLOWED_FORMATS.includes(ext)) {
      cb(null, true);
    } else {
      cb(new AppError(`Audio format .${ext} not allowed`, 415, 'INVALID_FORMAT'), false);
    }
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB max total
});

const uploadBoth = upload.fields([
  { name: 'file', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]);

module.exports = uploadBoth;