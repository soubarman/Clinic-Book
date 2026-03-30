const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');

// Initialize Firebase Admin (Required BEFORE importing app)
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Standard Cloud Function export for Express (Lazy Loaded to avoid CLI timeouts)
exports.api = onRequest({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  minInstances: 1, // Zero cold starts
  maxInstances: 50, // Auto-scale to huge traffic
  concurrency: 80, // High throughput handling
  cors: true, // Handle CORS at the Firebase level
}, (req, res) => {
  const app = require('./server');
  return app(req, res);
});
