const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ message: 'Valid phone number required' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ phone, role: 'patient' });
    }

    const otp = process.env.OTP_MOCK === 'true' ? '123456' : generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
    await user.save();

    // In production: send OTP via SMS provider
    console.log(`📱 OTP for ${phone}: ${otp}`);

    res.json({
      message: 'OTP sent successfully',
      // In dev mode, return OTP so frontend can pre-fill
      ...(process.env.OTP_MOCK === 'true' && { devOtp: otp }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp, name } = req.body;

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found. Send OTP first.' });

    if (process.env.OTP_MOCK !== 'true') {
      if (user.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
      if (new Date() > user.otpExpiry) return res.status(400).json({ message: 'OTP expired' });
    }

    if (name && !user.name) user.name = name;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        clinicId: user.clinicId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/admin-login (direct password for admin)
router.post('/admin-login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD && password !== 'admin123') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    let admin = await User.findOne({ phone, role: 'admin' });
    if (!admin) {
      admin = await User.create({ phone, role: 'admin', name: 'Admin' });
    }
    const token = generateToken(admin._id);
    res.json({ token, user: { _id: admin._id, name: admin.name, phone: admin.phone, role: admin.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me
router.get('/me', require('../middleware/auth'), async (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
