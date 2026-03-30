const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin (Required BEFORE importing app)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const app = require('./server');

// Standard Cloud Function export for Express
exports.api = onRequest({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  minInstances: 0,
  cors: true, // Handle CORS at the Firebase level
}, app);
