const express = require('express');
const router = express.Router();
const Doctor = require('../models/Doctor');
const Clinic = require('../models/Clinic');
const auth = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

// GET /api/doctors — public listing with filters
router.get('/', async (req, res) => {
  try {
    const { specialization, clinicId, search, available } = req.query;
    const filter = {};
    if (specialization) filter.specialization = new RegExp(specialization, 'i');
    if (clinicId) filter.clinicId = clinicId;
    if (available !== undefined) filter.available = available === 'true';
    if (search) filter.name = new RegExp(search, 'i');

    const doctors = await Doctor.find(filter)
      .populate('clinicId', 'name address city verified')
      .sort('-rating');

    // Only show doctors in verified clinics (for public)
    const filtered = doctors.filter(
      (d) => d.clinicId && d.clinicId.verified
    );

    res.json({ doctors: filtered });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('clinicId', 'name address city phone openTime closeTime');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/doctors — clinic adds a doctor
router.post('/', auth, roleGuard('clinic', 'admin'), async (req, res) => {
  try {
    const { name, specialization, qualification, experience, fee, slots, bio, clinicId } = req.body;

    let targetClinicId = clinicId;
    if (!targetClinicId) {
      const clinic = await Clinic.findOne({ owner: req.user._id });
      if (!clinic) return res.status(404).json({ message: 'Clinic not found for this account' });
      if (!clinic.verified) return res.status(403).json({ message: 'Clinic not verified yet' });
      targetClinicId = clinic._id;
    }

    const doctor = await Doctor.create({
      clinicId: targetClinicId, name, specialization,
      qualification: qualification || 'MBBS',
      experience: experience || 1,
      fee, slots: slots || [], bio,
    });

    res.status(201).json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/doctors/:id
router.put('/:id', auth, roleGuard('clinic', 'admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('clinicId');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (req.user.role !== 'admin') {
      if (String(doctor.clinicId.owner) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not your clinic doctor' });
      }
    }

    const allowed = ['name', 'specialization', 'qualification', 'experience', 'fee', 'slots', 'available', 'bio'];
    allowed.forEach((f) => { if (req.body[f] !== undefined) doctor[f] = req.body[f]; });
    await doctor.save();
    res.json({ doctor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/doctors/:id
router.delete('/:id', auth, roleGuard('clinic', 'admin'), async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate('clinicId');
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    if (req.user.role !== 'admin') {
      if (String(doctor.clinicId.owner) !== String(req.user._id)) {
        return res.status(403).json({ message: 'Not your clinic doctor' });
      }
    }

    await doctor.deleteOne();
    res.json({ message: 'Doctor deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/doctors/clinic/mine — get doctors for logged-in clinic
router.get('/clinic/mine', auth, roleGuard('clinic', 'admin'), async (req, res) => {
  try {
    const clinic = await Clinic.findOne({ owner: req.user._id });
    if (!clinic) return res.status(404).json({ message: 'No clinic found' });
    const doctors = await Doctor.find({ clinicId: clinic._id });
    res.json({ doctors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
