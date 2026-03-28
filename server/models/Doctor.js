const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
  day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] },
  startTime: { type: String },
  endTime: { type: String },
  maxPatients: { type: Number, default: 20 },
});

const doctorSchema = new mongoose.Schema(
  {
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true },
    qualification: { type: String, default: 'MBBS' },
    experience: { type: Number, default: 3 },
    fee: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    totalPatients: { type: Number, default: 0 },
    slots: [slotSchema],
    available: { type: Boolean, default: true },
    avatar: { type: String, default: '' },
    bio: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
