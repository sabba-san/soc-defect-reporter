// app/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Import Database
import { getStorage } from "firebase/storage";     // Import Storage

// Your specific keys (I copied these from what you sent)
const firebaseConfig = {
  apiKey: "AIzaSyDCT-sVnb4AwFQlHLgx42EzllDWKKrv3Ak",
  authDomain: "soc-defect-report.firebaseapp.com",
  projectId: "soc-defect-report",
  storageBucket: "soc-defect-report.firebasestorage.app",
  messagingSenderId: "61788702320",
  appId: "1:61788702320:web:74bc6c57b2542085f756b5",
  measurementId: "G-8P4LJEEBHQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export the tools so we can use them in page.tsx
export const db = getFirestore(app);
export const storage = getStorage(app);