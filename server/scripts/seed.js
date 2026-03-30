const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const Doctor = require('../models/Doctor');
const Booking = require('../models/Booking');

dotenv.config({ path: require('path').join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/clinic_booking';

const defaultSlots = [
  { day: 'Mon', startTime: '09:00', endTime: '13:00', maxPatients: 20 },
  { day: 'Tue', startTime: '09:00', endTime: '13:00', maxPatients: 20 },
  { day: 'Wed', startTime: '14:00', endTime: '18:00', maxPatients: 15 },
  { day: 'Thu', startTime: '09:00', endTime: '13:00', maxPatients: 20 },
  { day: 'Fri', startTime: '09:00', endTime: '13:00', maxPatients: 20 },
  { day: 'Sat', startTime: '10:00', endTime: '14:00', maxPatients: 12 },
];

async function seed() {
  // Safety check for production
  if (process.env.NODE_ENV === 'production' && !process.argv.includes('--force')) {
    console.error('❌ ERROR: Prevented seeding production database. Use --force if you are sure.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Wipe existing data
    await Promise.all([
      User.deleteMany({}),
      Clinic.deleteMany({}),
      Doctor.deleteMany({}),
      Booking.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // 1. Create Initial Admin (from env for security)
    const adminPhone = process.env.ADMIN_PHONE || '9999999999';
    const adminName = process.env.ADMIN_NAME || 'Super Admin';
    
    console.log(`👤 Creating Admin (${adminName})...`);
    await User.create({ 
      name: adminName, 
      phone: adminPhone, 
      role: 'admin', 
      profileComplete: true 
    });

    // 2. Create Patients
    console.log('👥 Creating Patients...');
    const patients = await User.insertMany([
      { name: 'Rahul Borgohain', phone: '8000000001', role: 'patient', profileComplete: true },
      { name: 'Priya Devi', phone: '8000000002', role: 'patient', profileComplete: true }
    ]);

    // 3. Create Clinic Owners & Clinics (Variety of statuses)
    console.log('🏥 Creating Clinics (Verified, Pending, Rejected)...');
    
    // Verified Clinic
    const ownerVerified = await User.create({ name: 'Verified Owner', phone: '9111111111', role: 'clinic', profileComplete: true });
    const clinicVerified = await Clinic.create({
      name: 'City Health Center (Verified)',
      address: 'AT Road, Sivasagar', phone: '9111111112',
      owner: ownerVerified._id, verified: true, active: true
    });
    await User.findByIdAndUpdate(ownerVerified._id, { clinicId: clinicVerified._id });

    // Pending Clinic
    const ownerPending = await User.create({ name: 'Pending Owner', phone: '9222222222', role: 'clinic', profileComplete: true });
    const clinicPending = await Clinic.create({
      name: 'New Life Clinic (Pending)',
      address: 'Jail Road, Sivasagar', phone: '9222222223',
      owner: ownerPending._id, verified: false, active: true
    });
    await User.findByIdAndUpdate(ownerPending._id, { clinicId: clinicPending._id });

    // Rejected Clinic
    const ownerRejected = await User.create({ name: 'Rejected Owner', phone: '9333333333', role: 'clinic', profileComplete: true });
    const clinicRejected = await Clinic.create({
      name: 'Problem Clinic (Rejected)',
      address: 'Old Station, Sivasagar', phone: '9333333334',
      owner: ownerRejected._id, verified: false, active: true,
      rejectionDate: new Date(),
      adminNote: 'Documents are expired. Please upload valid proof of clinic ownership.'
    });
    await User.findByIdAndUpdate(ownerRejected._id, { clinicId: clinicRejected._id });

    // 4. Create Doctors (only for verified clinic)
    console.log('👨‍⚕️ Creating Doctors...');
    const doctors = await Doctor.insertMany([
      {
        clinicId: clinicVerified._id,
        name: 'Dr. Arun Kumar',
        specialization: 'Cardiologist',
        qualification: 'MBBS, MD (Cardio)',
        experience: 12,
        fee: 500,
        rating: 4.8,
        totalPatients: 150,
        slots: defaultSlots,
        available: true,
      },
      {
        clinicId: clinicVerified._id,
        name: 'Dr. Priya Sharma',
        specialization: 'Pediatrician',
        qualification: 'MBBS, DCH',
        experience: 8,
        fee: 400,
        rating: 4.5,
        totalPatients: 210,
        slots: defaultSlots,
        available: true,
      }
    ]);

    // 5. Create Sample Bookings
    console.log('📅 Creating Sample Bookings...');
    const todayStr = new Date().toISOString().split('T')[0];
    await Booking.create({
      userId: patients[0]._id,
      doctorId: doctors[0]._id,
      clinicId: clinicVerified._id,
      slotDate: todayStr,
      slotDay: 'Mon',
      slotTime: '10:00 AM',
      tokenNumber: 1,
      status: 'confirmed',
      paymentStatus: 'paid',
      platformFee: 20
    });

    console.log('\n✅ Seed Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Test Credentials:');
    console.log(`  Admin    → Phone: ${adminPhone}`);
    console.log('  Verified → Phone: 9111111111');
    console.log('  Pending  → Phone: 9222222222');
    console.log('  Rejected → Phone: 9333333333');
    console.log('  Patient  → Phone: 8000000001');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
