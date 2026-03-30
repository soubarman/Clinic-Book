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
    console.error('❌ Error parsing ADMIN_SDK_JSON env var:', err.message);
  }
}

if (admin.apps.length === 0) {
  try {
    // 1. Try to initialize automatically (works in Cloud Functions/GCP)
    if (process.env.FIREBASE_CONFIG || process.env.FUNCTIONS_EMULATOR || !process.env.MONGO_URI || process.env.NODE_ENV === 'production') {
      admin.initializeApp();
      console.log('✅ Firebase initialized automatically (Cloud Environment)');
    } else {
      throw new Error('Not in cloud environment, trying manual load');
    }
  } catch (err) {
    // 2. Manual local loading fallback
    let serviceAccount;
    const potentialPaths = [
      path.join(__dirname, 'firebase-service-account.json'),
      path.join(__dirname, '..', 'firebase-service-account.json'),
    ];

    for (const p of potentialPaths) {
      if (fs.existsSync(p)) {
        try {
          serviceAccount = JSON.parse(fs.readFileSync(p, 'utf8'));
          console.log(`✅ Loaded Firebase Service Account from: ${p}`);
          break;
        } catch (e) {
          console.error(`❌ Error parsing Firebase JSON:`, e.message);
        }
      }
    }

    if (!serviceAccount && process.env.ADMIN_SDK_JSON) {
      try {
        serviceAccount = JSON.parse(process.env.ADMIN_SDK_JSON);
        console.log('✅ Loaded Firebase Service Account from env var');
      } catch (e) {
        console.error('❌ Error parsing ADMIN_SDK_JSON:', e.message);
      }
    }

    if (serviceAccount) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    } else {
      console.warn('⚠️ Firebase initialized with NO service account (limited access)');
      admin.initializeApp(); 
    }
  }
}

module.exports = admin;
