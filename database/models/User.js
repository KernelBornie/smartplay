const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['listener', 'artist', 'admin'], default: 'listener' },
  profilePicture: { type: String, default: '' },
  dateOfBirth: { type: Date },
  bio: { type: String, maxlength: 500 },
  genre: { type: String },
  website: { type: String },
  socialLinks: {
    spotify: String,
    soundcloud: String,
    youtube: String,
    instagram: String,
    twitter: String
  },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan' },
  planExpiresAt: { type: Date },
  totalStreams: { type: Number, default: 0 },
  totalDownloads: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  frozen: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);