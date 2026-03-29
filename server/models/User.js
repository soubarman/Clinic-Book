const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true }, // Optional — Google users may not have phone yet
    email: { type: String, trim: true, lowercase: true },
    googleId: { type: String }, // Firebase UID for Google/email auth
    password: { type: String }, // For email/password auth (hashed)
    role: { type: String, enum: ['patient', 'clinic', 'admin'], default: 'patient' },
    avatar: { type: String, default: '' },
    area: { type: String, trim: true },
    city: { type: String, trim: true, default: 'Sivasagar' },
    profileComplete: { type: Boolean, default: false }, // True after name+phone+area filled
    isBlocked: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  },
  { timestamps: true }
);

// Ensure unique constraints only when values exist
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ googleId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
