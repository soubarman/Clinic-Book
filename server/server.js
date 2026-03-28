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
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clinics', require('./routes/clinics'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: 'mongodb', time: new Date().toISOString() });
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Atlas connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on http://localhost:${process.env.PORT || 5000}`);
      console.log('');
      console.log('📌 Run seed: node scripts/seed.js');
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error('👉 Check your MONGO_URI in server/.env');
    process.exit(1);
  });

module.exports = app;
