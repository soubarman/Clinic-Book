const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// GET /api/bookings/mine — patient's own bookings
router.get('/mine', auth, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('doctorId', 'name specialization avatar fee')
      .populate('clinicId', 'name address city')
      .sort('-createdAt');
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/clinic — clinic's bookings
router.get('/clinic', auth, roleGuard('clinic', 'admin'), async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ owner: req.user._id });
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });

    const { date, status } = req.query;
    const filter = { clinicId: clinic._id };
    if (date) filter.slotDate = date;
    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('userId', 'name phone')
      .populate('doctorId', 'name specialization')
      .sort('slotDate slotTime');
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/bookings — create booking (after payment)
router.post('/', auth, async (req, res) => {
  try {
    const { doctorId, slotDate, slotTime, slotDay, notes, paymentId, razorpayOrderId } = req.body;

    const doctor = await Doctor.findById(doctorId).populate('clinicId');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    if (!doctor.clinicId.verified) return res.status(400).json({ message: 'Clinic not verified' });

    // Count existing bookings for same slot to get token number
    const existingCount = await Booking.countDocuments({
      doctorId, slotDate, slotTime, status: { $ne: 'cancelled' },
    });

    const booking = await Booking.create({
      userId: req.user._id,
      doctorId,
      clinicId: doctor.clinicId._id,
      slotDate,
      slotTime,
      slotDay,
      tokenNumber: existingCount + 1,
      status: paymentId ? 'confirmed' : 'pending',
      paymentStatus: paymentId ? 'paid' : 'pending',
      paymentId: paymentId || '',
      razorpayOrderId: razorpayOrderId || '',
      notes,
      platformFee: 20,
    });

    // Update clinic total bookings
    await Clinic.findByIdAndUpdate(doctor.clinicId._id, { $inc: { totalBookings: 1 } });
    await Doctor.findByIdAndUpdate(doctorId, { $inc: { totalPatients: 1 } });

    await booking.populate(['doctorId', 'clinicId']);
    res.status(201).json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bookings/:id/cancel
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.userId) !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your booking' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/bookings/:id/complete — clinic marks complete
router.put('/:id/complete', auth, roleGuard('clinic', 'admin'), async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    booking.status = 'completed';
    await booking.save();
    res.json({ booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
