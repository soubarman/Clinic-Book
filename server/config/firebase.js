const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;
const potentialPaths = [
  path.join(__dirname, 'firebase-service-account.json'),
  path.join(__dirname, '..', 'firebase-service-account.json'),
];

// 1. Try to find the local JSON file
for (const p of potentialPaths) {
  if (fs.existsSync(p)) {
    try {
      serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
      console.log(`✅ Loaded Firebase Service Account from: ${p}`);
      break;
    } catch (e) {
      console.error(`❌ Error parsing Firebase JSON at ${p}:`, e.message);
    }
  }
}

// 2. Try to fallback to the env var if not found on disk
if (!serviceAccount && process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    console.log('✅ Loaded Firebase Service Account from environment variable');
  } catch (err) {
    console.error('❌ Error parsing FIREBASE_SERVICE_ACCOUNT env var:', err.message);
  }
}

if (!serviceAccount) {
  console.error('\n⚠️  FIREBASE ERROR: No Service Account found!');
  console.error('👉 Please save your Firebase JSON as: server/config/firebase-service-account.json');
} else {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
}

module.exports = admin;
