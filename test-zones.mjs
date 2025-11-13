// Script pour tester l'accès aux 4 zones Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const zones = [
  {
    name: 'Zone 1',
    config: {
      apiKey: "AIzaSyDjBnGtyG-s6go-htxQhjUoHTm-qor7byw",
      authDomain: "maintenance-zone1.firebaseapp.com",
      projectId: "maintenance-zone1",
      storageBucket: "maintenance-zone1.firebasestorage.app",
      messagingSenderId: "705088600833",
      appId: "1:705088600833:web:a00966180d42bce4fd3900"
    }
  },
  {
    name: 'Zone 2',
    config: {
      apiKey: "AIzaSyAfNvT_MWqboE0vD07BiCc7PdUq--saoXk",
      authDomain: "maintenance-zone2.firebaseapp.com",
      projectId: "maintenance-zone2",
      storageBucket: "maintenance-zone2.firebasestorage.app",
      messagingSenderId: "380419772825",
      appId: "1:380419772825:web:f822e1ef90384c8dcf0308"
    }
  },
  {
    name: 'Zone 3',
    config: {
      apiKey: "AIzaSyAyt3NOJ8Is66cEjiM-aLeOI0BhHiXVYho",
      authDomain: "maintenance-zone3.firebaseapp.com",
      projectId: "maintenance-zone3",
      storageBucket: "maintenance-zone3.firebasestorage.app",
      messagingSenderId: "662402186163",
      appId: "1:662402186163:web:0e77b72393e8bc289469c6"
    }
  },
  {
    name: 'Zone 4',
    config: {
      apiKey: "AIzaSyDI8otKp5tZJcLYcZY3-crPEfcdPy33I0c",
      authDomain: "maintenance-zone4.firebaseapp.com",
      projectId: "maintenance-zone4",
      storageBucket: "maintenance-zone4.firebasestorage.app",
      messagingSenderId: "401587012447",
      appId: "1:401587012447:web:f119d416d0212c38a92cea"
    }
  }
];

const ADMIN_EMAIL = "brianskuratko@gmail.com";
const ADMIN_PASSWORD = "Ingodwetrust";

async function testZone(zoneName, config) {
  try {
    const app = initializeApp(config, zoneName);
    const auth = getAuth(app);
    const db = getFirestore(app);

    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    await getDocs(collection(db, 'etablissements'));

    console.log(`✅ ${zoneName} : OK`);
    return true;
  } catch (error) {
    if (error.code === 'permission-denied' || error.message.includes('permissions')) {
      console.log(`❌ ${zoneName} : PERMISSIONS MANQUANTES`);
      console.log(`   → Va sur https://console.firebase.google.com/project/${config.projectId}/firestore/rules`);
    } else {
      console.log(`⚠️  ${zoneName} : ${error.message}`);
    }
    return false;
  }
}

async function testAllZones() {
  console.log('🔍 Test des permissions sur les 4 zones...\n');
  
  for (const zone of zones) {
    await testZone(zone.name, zone.config);
  }
  
  console.log('\n✨ Test terminé !');
}

testAllZones();
