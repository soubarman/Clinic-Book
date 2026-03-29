import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA4y5HktqqLOHEBIz89LPr2HcbZz8ONx5Y",
  authDomain: "clinic-booking-app-fe9f4.firebaseapp.com",
  projectId: "clinic-booking-app-fe9f4",
  storageBucket: "clinic-booking-app-fe9f4.firebasestorage.app",
  messagingSenderId: "573297290262",
  appId: "1:573297290262:web:c48bc391cdad7c2ff31937",
  measurementId: "G-QQZDJXK7TL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
