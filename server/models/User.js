const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    role: { type: String, enum: ['patient', 'clinic', 'admin'], default: 'patient' },
    email: { type: String, trim: true, lowercase: true },
    avatar: { type: String, default: '' },
    isBlocked: { type: Boolean, default: false },
    otp: { type: String },
    otpExpiry: { type: Date },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
