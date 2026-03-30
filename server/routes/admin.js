const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Booking = require('../models/Booking');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const adminGuard = [auth, roleGuard('admin')];

// GET /api/admin/stats
router.get('/stats', ...adminGuard, async (req, res) => {
  try {
    const [totalUsers, totalClinics, verifiedClinics, totalDoctors, totalBookings, confirmedBookings] =
      await Promise.all([
        User.countDocuments({ role: 'patient' }),
        Clinic.countDocuments(),
        Clinic.countDocuments({ verified: true }),
        Doctor.countDocuments(),
        Booking.countDocuments(),
        Booking.countDocuments({ paymentStatus: 'paid' }),
      ]);

    const totalRevenue = confirmedBookings * 20;

    res.json({
      stats: { totalUsers, totalClinics, verifiedClinics, totalDoctors, totalBookings, confirmedBookings, totalRevenue },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/clinics — all clinics (verified + unverified)
router.get('/clinics', ...adminGuard, async (req, res) => {
  try {
    const clinics = await Clinic.find().populate('owner', 'name phone').sort('-createdAt');
    res.json({ clinics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/clinics/:id/verify
router.put('/clinics/:id/verify', ...adminGuard, async (req, res) => {
  try {
    const { verified, adminNote } = req.body;
    const clinic = await Clinic.findById(req.params.id).populate('owner', 'name phone');
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });

    clinic.verified = verified;
    clinic.adminNote = adminNote || '';
    
    if (!verified) {
      clinic.rejectionDate = new Date();
    } else {
      clinic.rejectionDate = null;
    }

    await clinic.save();
    res.json({ clinic, message: verified ? 'Clinic approved' : 'Clinic rejected' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/clinics/:id/toggle
router.put('/clinics/:id/toggle', ...adminGuard, async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });
    clinic.active = !clinic.active;
    await clinic.save();
    res.json({ clinic, message: `Clinic ${clinic.active ? 'activated' : 'deactivated'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/users — only show non-admins
router.get('/users', ...adminGuard, async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-otp -otpExpiry').sort('-createdAt');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/admin/users/:id/block
router.put('/users/:id/block', ...adminGuard, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ user, message: `User ${user.isBlocked ? 'blocked' : 'unblocked'}` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/admin/bookings
router.get('/bookings', ...adminGuard, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('userId', 'name phone')
      .populate('doctorId', 'name specialization')
      .populate('clinicId', 'name city')
      .sort('-createdAt')
      .limit(100);
    res.json({ bookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
