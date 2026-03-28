const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Booking = require('../models/Booking');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic_booking';

const specializations = ['Cardiologist', 'Neurologist', 'Dermatologist', 'Psychiatrist', 'Orthopedic', 'Pediatrician', 'General Physician', 'ENT Specialist', 'Nephrologist', 'Endocrinologist'];

const doctorNames = [
  'Dr. Arun Kumar', 'Dr. Priya Sharma', 'Dr. Rajesh Bora', 'Dr. Meenakshi Das',
  'Dr. Bikash Gogoi', 'Dr. Sima Phukan', 'Dr. Tarun Barua', 'Dr. Nandita Roy',
  'Dr. Hiren Kalita', 'Dr. Ankita Baruah', 'Dr. Manash Das', 'Dr. Rekha Borah',
];

const clinicData = [
  { name: 'Apollo Clinic Sivasagar', address: 'AT Road, Sivasagar, Assam', city: 'Sivasagar', phone: '9876543210', description: 'Leading multi-specialty clinic in Sivasagar', specializations: ['Cardiology', 'Neurology', 'General'], rating: 4.8 },
  { name: 'City Health Center', address: 'Nehru Park Road, Sivasagar', city: 'Sivasagar', phone: '9876543211', description: 'Affordable healthcare for all', specializations: ['Pediatrics', 'Dermatology'], rating: 4.5 },
  { name: 'Guwahati Medical Hub', address: 'GS Road, Guwahati, Assam', city: 'Guwahati', phone: '9876543212', description: 'State-of-the-art facilities', specializations: ['Orthopedics', 'ENT', 'Psychiatry'], rating: 4.7 },
  { name: 'Prime Care Clinic', address: 'Chandmari, Guwahati', city: 'Guwahati', phone: '9876543213', description: 'Trusted family healthcare since 2010', specializations: ['General', 'Endocrinology'], rating: 4.6 },
];

const defaultSlots = [
  { day: 'Mon', startTime: '09:00', endTime: '13:00', maxPatients: 20 },
  { day: 'Tue', startTime: '09:00', endTime: '13:00', maxPatients: 20 },
  { day: 'Wed', startTime: '14:00', endTime: '18:00', maxPatients: 15 },
  { day: 'Thu', startTime: '09:00', endTime: '13:00', maxPatients: 20 },
  { day: 'Fri', startTime: '09:00', endTime: '13:00', maxPatients: 20 },
  { day: 'Sat', startTime: '10:00', endTime: '14:00', maxPatients: 12 },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Drop all collections (removes stale indexes too)
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      await db.collection(col.name).drop().catch(() => {}); // ignore "ns not found"
    }
    console.log('🗑️  Cleared existing data & indexes');

    // Create admin
    const admin = await User.create({ name: 'Admin', phone: '9999999999', role: 'admin' });
    console.log('👤 Admin created');

    // Create patient users
    const patients = await User.insertMany([
      { name: 'Rahul Borgohain', phone: '9000000001', role: 'patient' },
      { name: 'Priya Devi', phone: '9000000002', role: 'patient' },
      { name: 'Amit Saikia', phone: '9000000003', role: 'patient' },
      { name: 'Sunita Kalita', phone: '9000000004', role: 'patient' },
    ]);
    console.log(`👥 ${patients.length} patients created`);

    // Create clinic owners
    const clinicOwners = await User.insertMany(
      clinicData.map((_, i) => ({ name: `Clinic Owner ${i + 1}`, phone: `900000100${i + 1}`, role: 'clinic' }))
    );

    // Create clinics (verified)
    const clinics = await Clinic.insertMany(
      clinicData.map((c, i) => ({ ...c, owner: clinicOwners[i]._id, verified: true, active: true, totalBookings: Math.floor(Math.random() * 200) }))
    );

    // Update clinic owner users with clinicId
    for (let i = 0; i < clinics.length; i++) {
      await User.findByIdAndUpdate(clinicOwners[i]._id, { clinicId: clinics[i]._id });
    }
    console.log(`🏥 ${clinics.length} clinics created`);

    // Create doctors (3 per clinic)
    const doctors = [];
    for (let i = 0; i < clinics.length; i++) {
      for (let j = 0; j < 3; j++) {
        const nameIdx = i * 3 + j;
        const spec = specializations[(i * 3 + j) % specializations.length];
        doctors.push({
          clinicId: clinics[i]._id,
          name: doctorNames[nameIdx] || `Dr. Doctor ${nameIdx + 1}`,
          specialization: spec,
          qualification: ['MBBS', 'MD', 'MS', 'MBBS, DM'][Math.floor(Math.random() * 4)],
          experience: Math.floor(Math.random() * 15) + 2,
          fee: [300, 400, 500, 600, 700, 800][Math.floor(Math.random() * 6)],
          rating: parseFloat((4.0 + Math.random() * 1).toFixed(1)),
          totalPatients: Math.floor(Math.random() * 500),
          slots: defaultSlots,
          available: true,
        });
      }
    }

    const createdDoctors = await Doctor.insertMany(doctors);
    console.log(`👨‍⚕️ ${createdDoctors.length} doctors created`);

    // Create sample bookings
    const today = new Date();
    const bookings = [];
    const statuses = ['confirmed', 'completed', 'completed', 'cancelled', 'confirmed'];
    for (let i = 0; i < 10; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + (i % 3) - 1);
      const doctor = createdDoctors[i % createdDoctors.length];
      const patient = patients[i % patients.length];
      const status = statuses[i % statuses.length];
      bookings.push({
        userId: patient._id,
        doctorId: doctor._id,
        clinicId: doctor.clinicId,
        slotDate: date.toISOString().split('T')[0],
        slotDay: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][date.getDay() % 5],
        slotTime: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM'][i % 4],
        tokenNumber: i + 1,
        status,
        paymentStatus: status !== 'cancelled' ? 'paid' : 'pending',
        paymentId: status !== 'cancelled' ? `mock_pay_${Date.now()}_${i}` : '',
        platformFee: 20,
      });
    }

    await Booking.insertMany(bookings);
    console.log(`📅 ${bookings.length} bookings created`);

    console.log('\n✅ Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test Credentials:');
    console.log('  Admin    → Phone: 9999999999, Password: admin123');
    console.log('  Patient  → Phone: 9000000001, OTP: 123456');
    console.log('  Clinic   → Phone: 9000000001X (owner phones)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
