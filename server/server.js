const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const connectDB = require('./config/db');

const app = express();

// Standard Middleware
app.use(cors({
  origin: true, // Allow all origins for debugging
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 1. Database Connection Middleware (ensures DB is connected before any route hits)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
    res.status(500).json({ 
      message: 'Internal Server Error (DB Connection Failed)',
      error: err.message,
      check: 'Have you added MONGO_URI to your Google Cloud Run Environment Variables?'
    });
  }
});

// 2. Root "Alive" Route (to confirm the URL works)
app.get('/', (req, res) => {
  res.json({ message: '🚀 Clinic Booking Backend is UP!', environment: process.env.NODE_ENV || 'production' });
});

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
      env_mongo_uri_exists: !!process.env.MONGO_URI,
      mongo_uri_first_chars: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) : 'N/A'
    });
  }
});

// Debug catch-all route
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'Not Found',
    debug: 'The request reached your Express app!',
    receivedMethod: req.method,
    receivedPath: req.originalUrl || req.url,
    basePath: req.baseUrl,
    query: req.query,
    headers: { host: req.headers.host, 'user-agent': req.headers['user-agent'] },
  });
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
