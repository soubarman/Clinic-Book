const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Clinic = require('../models/Clinic');
const User = require('../models/User');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

const admin = require('firebase-admin');
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// GET /api/clinics — public listing of verified clinics
router.get('/', async (req, res) => {
  try {
    const { city, search } = req.query;
    // Only show active AND verified clinics to the public
    const filter = { active: true, verified: true };
    if (city) filter.city = new RegExp(city, 'i');
    if (search) filter.name = new RegExp(search, 'i');

    const clinics = await Clinic.find(filter).populate('owner', 'name phone').sort('-createdAt');
    res.json({ clinics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/clinics/:id
router.get('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id).populate('owner', 'name phone');
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });
    res.json({ clinic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/clinics/register — clinic registers
router.post('/register', auth, upload.array('documents', 5), async (req, res) => {
  try {
    const { name, address, city, phone, email, description } = req.body;
    const existing = await Clinic.findOne({ owner: req.user._id });
    if (existing) return res.status(400).json({ message: 'You already have a clinic registered' });

    // Upload to Firebase Storage
    const documents = [];
    if (req.files && req.files.length > 0) {
      const bucket = admin.storage().bucket('clinic-booking-app-fe9f4.firebasestorage.app');

      for (const file of req.files) {
        const fileName = `clinic_docs/${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
        const blob = bucket.file(fileName);
        const blobStream = blob.createWriteStream({
          metadata: { contentType: file.mimetype },
          resumable: false,
        });

        await new Promise((resolve, reject) => {
          blobStream.on('error', reject);
          blobStream.on('finish', async () => {
            // Make public and get URL
            await blob.makePublic();
            const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            documents.push(publicUrl);
            resolve();
          });
          blobStream.end(file.buffer);
        });
      }
    }

    const clinic = await Clinic.create({
      name, address, city: city || 'Sivasagar', phone, email, description,
      documents, owner: req.user._id, verified: false,
    });

    // Link clinic to user
    await User.findByIdAndUpdate(req.user._id, { role: 'clinic', clinicId: clinic._id });

    res.status(201).json({ message: 'Clinic registered. Awaiting admin verification.', clinic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/clinics/:id — clinic updates its own info
router.put('/:id', auth, roleGuard('clinic', 'admin'), async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ message: 'Clinic not found' });
    if (req.user.role !== 'admin' && String(clinic.owner) !== String(req.user._id)) {
      return res.status(403).json({ message: 'Not your clinic' });
    }

    const allowed = ['name', 'address', 'city', 'phone', 'email', 'description', 'openTime', 'closeTime'];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) clinic[field] = req.body[field];
    });
    await clinic.save();
    res.json({ clinic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/clinics/mine — get logged-in clinic user's clinic
router.get('/mine/info', auth, roleGuard('clinic', 'admin'), async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ owner: req.user._id });
    if (!clinic) return res.status(404).json({ message: 'No clinic found for this account' });
    res.json({ clinic });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
