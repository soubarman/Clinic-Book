const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const connectDB = require('./config/db');

// Initialize Firebase Admin (Only if not already initialized)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const app = require('./server');

// Cloud Function export
exports.api = onRequest({
  region: 'us-central1', // Update based on your preferred region
  memory: '256MiB',
  timeoutSeconds: 60,
  minInstances: 0,
}, async (req, res) => {
  try {
    // Ensure MongoDB is connected before handling the request
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('❌ Cloud Function Internal Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error (DB)' });
  }
});
