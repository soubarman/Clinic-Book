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

    // Force drop existing phone index to fix sparse/unique issues if any
    try {
      await mongoose.connection.collection('users').dropIndex('phone_1');
      console.log('🧹 Cleaned up old phone index');
    } catch (e) {
      // Index might not exist, that's fine
    }

    return cachedConnection;
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;
