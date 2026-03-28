const mongoose = require('mongoose');

const clinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    city: { type: String, default: 'Sivasagar' },
    phone: { type: String, required: true },
    email: { type: String, trim: true },
    description: { type: String },
    specializations: [{ type: String }],
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    documents: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, default: 4.5 },
    totalBookings: { type: Number, default: 0 },
    image: { type: String, default: '' },
    openTime: { type: String, default: '09:00' },
    closeTime: { type: String, default: '18:00' },
    adminNote: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Clinic', clinicSchema);
