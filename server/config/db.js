const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection) {
    console.log('✅ Reusing existing MongoDB connection');
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    cachedConnection = conn;
    console.log('🚀 New MongoDB connection established');
    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;
