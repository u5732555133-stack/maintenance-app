// Firebase Configuration for all maintenance zones
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Zone 1 Configuration
const firebaseConfigZone1 = {
  apiKey: "AIzaSyDjBnGtyG-s6go-htxQhjUoHTm-qor7byw",
  authDomain: "maintenance-zone1.firebaseapp.com",
  projectId: "maintenance-zone1",
  storageBucket: "maintenance-zone1.firebasestorage.app",
  messagingSenderId: "705088600833",
  appId: "1:705088600833:web:a00966180d42bce4fd3900",
  measurementId: "G-MLSRQLQLW7"
};

// Zone 2 Configuration
const firebaseConfigZone2 = {
  apiKey: "AIzaSyAfNvT_MWqboE0vD07BiCc7PdUq--saoXk",
  authDomain: "maintenance-zone2.firebaseapp.com",
  projectId: "maintenance-zone2",
  storageBucket: "maintenance-zone2.firebasestorage.app",
  messagingSenderId: "380419772825",
  appId: "1:380419772825:web:f822e1ef90384c8dcf0308",
  measurementId: "G-3B1TTRVV4N"
};

// Zone 3 Configuration
const firebaseConfigZone3 = {
  apiKey: "AIzaSyAyt3NOJ8Is66cEjiM-aLeOI0BhHiXVYho",
  authDomain: "maintenance-zone3.firebaseapp.com",
  projectId: "maintenance-zone3",
  storageBucket: "maintenance-zone3.firebasestorage.app",
  messagingSenderId: "662402186163",
  appId: "1:662402186163:web:0e77b72393e8bc289469c6",
  measurementId: "G-DSMGYSCWVJ"
};

// Zone 4 Configuration
const firebaseConfigZone4 = {
  apiKey: "AIzaSyDI8otKp5tZJcLYcZY3-crPEfcdPy33I0c",
  authDomain: "maintenance-zone4.firebaseapp.com",
  projectId: "maintenance-zone4",
  storageBucket: "maintenance-zone4.firebasestorage.app",
  messagingSenderId: "401587012447",
  appId: "1:401587012447:web:f119d416d0212c38a92cea",
  measurementId: "G-0V3ZPZTF7C"
};

// Initialize Firebase apps for each zone
export const appZone1 = initializeApp(firebaseConfigZone1, "zone1");
export const appZone2 = initializeApp(firebaseConfigZone2, "zone2");
export const appZone3 = initializeApp(firebaseConfigZone3, "zone3");
export const appZone4 = initializeApp(firebaseConfigZone4, "zone4");

// Initialize services for each zone
export const analyticsZone1 = getAnalytics(appZone1);
export const analyticsZone2 = getAnalytics(appZone2);
export const analyticsZone3 = getAnalytics(appZone3);
export const analyticsZone4 = getAnalytics(appZone4);

export const authZone1 = getAuth(appZone1);
export const authZone2 = getAuth(appZone2);
export const authZone3 = getAuth(appZone3);
export const authZone4 = getAuth(appZone4);

export const dbZone1 = getFirestore(appZone1);
export const dbZone2 = getFirestore(appZone2);
export const dbZone3 = getFirestore(appZone3);
export const dbZone4 = getFirestore(appZone4);

// Helper to get services by zone number
export const getFirebaseServices = (zone: 1 | 2 | 3 | 4) => {
  const services = {
    1: { app: appZone1, analytics: analyticsZone1, auth: authZone1, db: dbZone1 },
    2: { app: appZone2, analytics: analyticsZone2, auth: authZone2, db: dbZone2 },
    3: { app: appZone3, analytics: analyticsZone3, auth: authZone3, db: dbZone3 },
    4: { app: appZone4, analytics: analyticsZone4, auth: authZone4, db: dbZone4 },
  };
  return services[zone];
};