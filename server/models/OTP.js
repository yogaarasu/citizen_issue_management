import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  type: { type: String, required: true, enum: ['registration', 'password_reset'] },
  createdAt: { type: Number, default: Date.now },
  expiresAt: { type: Number, required: true },
  isUsed: { type: Boolean, default: false }
});

// Index for cleanup and lookup
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OTP', otpSchema);
