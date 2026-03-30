const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL?.replace(/\/$/, ''),
  'https://clinic-book.vercel.app', // Adding it directly to be safe
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl) 
    // or if the origin is in our allowed list
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      console.warn('CORS Blocked Origin:', origin);
      callback(null, true); // Allow it anyway for now to solve the 500 error and 404
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/clinics', require('./routes/clinics'));
app.use('/doctors', require('./routes/doctors'));
app.use('/bookings', require('./routes/bookings'));
app.use('/payments', require('./routes/payments'));
app.use('/admin', require('./routes/admin'));

// Smart Health check
app.get('/health', async (req, res) => {
  try {
    const Doctor = require('./models/Doctor');
    const Clinic = require('./models/Clinic');
    const [doctors, clinics] = await Promise.all([
      Doctor.countDocuments(),
      Clinic.countDocuments()
    ]);
    res.json({ 
      status: 'ok', 
      database: 'connected', 
      doctorsCount: doctors, 
      clinicsCount: clinics,
      time: new Date().toISOString() 
    });
  } catch (err) {
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to connect to Database', 
      error: err.message,
      env_mongo_uri_exists: !!process.env.MONGO_URI 
    });
  }
});

// MongoDB Connection & Listen (Only if run directly, not in Functions)
if (require.main === module) {
  const connectDB = require('./config/db');
  connectDB()
    .then(() => {
      const port = process.env.LOCAL_PORT || 5000;
      app.listen(port, () => {
        console.log(`🚀 Dedicated server running on http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to start standalone server:', err.message);
      process.exit(1);
    });
}

module.exports = app;
