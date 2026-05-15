const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { AppError, logger } = require('@smartplay/shared');
const User = require('../../../../database/models/User');
const Plan = require('../../../../database/models/Plan');

// Multer for profile pictures
const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../../../uploads/profiles'),
  filename: (req, file, cb) => {
    cb(null, `profile-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// ─── Register ───
router.post('/register', async (req, res, next) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Username, email, and password are required' } });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, error: { message: 'Email already registered' } });
    const user = await User.create({ username, email, password, role: role || 'listener' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    logger.info('User registered', { userId: user._id });
    res.status(201).json({ success: true, data: { token, user: { id: user._id, username: user.username, email: user.email, role: user.role } } });
  } catch (err) {
    next(err);
  }
});

// ─── Login ───
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: { message: 'Email and password are required' } });
    }
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, error: { message: 'Invalid credentials' } });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    logger.info('User logged in', { userId: user._id });
    res.json({ success: true, data: { token, user: { id: user._id, username: user.username, email: user.email, role: user.role } } });
  } catch (err) {
    next(err);
  }
});

// ─── Forgot Password ───
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: { message: 'Email is required' } });
    }
    const user = await User.findOne({ email });
    if (!user) {
      // Still return success to prevent email enumeration
      return res.json({ success: true, message: 'If that email exists, a reset token has been generated. Check the server logs or API response.' });
    }

    // Generate a short‑lived token (15 min)
    const resetToken = jwt.sign(
      { email: user.email, purpose: 'password-reset' },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '15m' }
    );

    logger.info(`Password reset token generated for ${user.email}: ${resetToken}`);

    // In production you would send an email here.
    // For development we return the token in the response.
    res.json({
      success: true,
      message: 'Password reset token generated. Use it to reset your password.',
      resetToken   // only for dev; remove in production
    });
  } catch (err) {
    next(err);
  }
});

// ─── Reset Password ───
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, error: { message: 'Token and new password are required' } });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    } catch (err) {
      return res.status(400).json({ success: false, error: { message: 'Invalid or expired token' } });
    }

    if (decoded.purpose !== 'password-reset') {
      return res.status(400).json({ success: false, error: { message: 'Invalid token purpose' } });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(400).json({ success: false, error: { message: 'User not found' } });
    }

    // Update password (will be hashed by pre‑save hook)
    user.password = newPassword;
    await user.save();

    logger.info(`Password reset successful for ${user.email}`);
    res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

// ─── Profile & Plan routes (unchanged) ───
router.get('/profile', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findById(decoded.id).select('-password').populate('plan');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.put('/profile', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const updates = {};
    const allowed = ['username', 'bio', 'genre', 'website', 'socialLinks', 'dateOfBirth'];
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(decoded.id, updates, { new: true }).select('-password').populate('plan');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.post('/profile/picture', upload.single('picture'), async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const user = await User.findByIdAndUpdate(decoded.id, 
      { profilePicture: `/uploads/profiles/${req.file.filename}` },
      { new: true }
    ).select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

router.get('/plans', async (req, res) => {
  const plans = await Plan.find();
  res.json({ success: true, data: plans });
});

router.post('/subscribe', async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    const { planId } = req.body;
    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });
    const user = await User.findByIdAndUpdate(decoded.id, {
      plan: plan._id,
      planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }, { new: true }).populate('plan').select('-password');
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;