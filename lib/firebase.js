import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';   // 👈 ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyCVMDartab5IxOVaCM2G21Et3pcnW5ZPuQ",
  authDomain: "fridaynightcurryburgerclub.firebaseapp.com",
  projectId: "fridaynightcurryburgerclub",
  storageBucket: "fridaynightcurryburgerclub.firebasestorage.app",
  messagingSenderId: "1066023025524",
  appId: "1:1066023025524:web:2eace23dc6b60e774d0a21"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);   // 👈 ADD THIS
