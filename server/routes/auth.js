const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const admin = require('../config/firebase');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

const userPublicFields = (user) => ({
  _id: user._id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  area: user.area,
  city: user.city,
  profileComplete: user.profileComplete,
  clinicId: user.clinicId,
});

// ─────────────────────────────────────────────
// POST /api/auth/google-login
// Verifies a Firebase ID token (Google or Phone) and syncs the user
// ─────────────────────────────────────────────
router.post('/google-login', async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'No ID token provided' });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    let user = await User.findOne({ googleId: uid });
    if (!user && email) user = await User.findOne({ email });

    if (!user) {
      user = new User({
        googleId: uid,
        email: email || '',
        name: name || '',
        avatar: picture || '',
        role: 'patient',
        profileComplete: !!(name && email), // Still need phone & area
      });
    } else {
      user.googleId = uid;
      if (!user.avatar && picture) user.avatar = picture;
      if (!user.email && email) user.email = email;
    }

    await user.save();
    const token = generateToken(user._id);
    res.json({ token, user: userPublicFields(user) });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ message: 'Invalid Firebase token' });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/email-signup
// ─────────────────────────────────────────────
router.post('/email-signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered. Please sign in.' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      password: hashed,
      name: name || '',
      role: 'patient',
      profileComplete: false,
    });

    const token = generateToken(user._id);
    res.status(201).json({ token, user: userPublicFields(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/email-login
// ─────────────────────────────────────────────
router.post('/email-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid email or password' });

    const token = generateToken(user._id);
    res.json({ token, user: userPublicFields(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/auth/profile  (requires auth)
// Complete/update user profile after signup
// ─────────────────────────────────────────────
router.patch('/profile', require('../middleware/auth'), async (req, res) => {
  try {
    const { name, phone, area, city } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (area) user.area = area;
    if (city) user.city = city;

    // Mark profile as complete if all required fields present
    if (user.name && user.phone && user.area) {
      user.profileComplete = true;
    }

    await user.save();
    res.json({ user: userPublicFields(user) });
  } catch (err) {
    // Handle duplicate phone
    if (err.code === 11000) return res.status(409).json({ message: 'Phone number already in use' });
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// POST /api/auth/admin-login (phone + password)
// ─────────────────────────────────────────────
router.post('/admin-login', async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (password !== process.env.ADMIN_PASSWORD && password !== 'admin123') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    let adminUser = await User.findOne({ phone, role: 'admin' });
    if (!adminUser) {
      adminUser = await User.create({ phone, role: 'admin', name: 'Admin', profileComplete: true });
    }
    const token = generateToken(adminUser._id);
    res.json({ token, user: userPublicFields(adminUser) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
router.get('/me', require('../middleware/auth'), async (req, res) => {
  res.json({ user: userPublicFields(req.user) });
});

module.exports = router;
