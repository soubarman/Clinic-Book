const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    clinicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Clinic', required: true },
    slotDate: { type: String, required: true }, // 'YYYY-MM-DD'
    slotDay: { type: String }, // 'Mon', 'Tue' etc
    slotTime: { type: String, required: true }, // '10:00 AM'
    tokenNumber: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String },
    razorpayOrderId: { type: String },
    platformFee: { type: Number, default: 20 },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
