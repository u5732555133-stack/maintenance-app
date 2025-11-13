// Script pour créer le compte Super Admin
// Exécute avec : node create-admin.mjs

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

// Configuration Firebase Zone 1 (Super Admin)
const firebaseConfig = {
  apiKey: "AIzaSyDjBnGtyG-s6go-htxQhjUoHTm-qor7byw",
  authDomain: "maintenance-zone1.firebaseapp.com",
  projectId: "maintenance-zone1",
  storageBucket: "maintenance-zone1.firebasestorage.app",
  messagingSenderId: "705088600833",
  appId: "1:705088600833:web:a00966180d42bce4fd3900",
  measurementId: "G-MLSRQLQLW7"
};

// Informations du Super Admin
const ADMIN_NAME = "Brian Skuratko";
const ADMIN_EMAIL = "brianskuratko@gmail.com";
const ADMIN_PASSWORD = "Ingodwetrust";

async function createSuperAdmin() {
  try {
    console.log('🚀 Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('👤 Création du compte Super Admin...');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Nom: ${ADMIN_NAME}`);

    // Crée le compte dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const uid = userCredential.user.uid;

    console.log(`✅ Compte créé dans Firebase Auth`);
    console.log(`   UID: ${uid}`);

    // Ajoute le document dans Firestore
    await setDoc(doc(db, 'superAdmins', uid), {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      createdAt: new Date(),
    });

    console.log('✅ Document créé dans Firestore');
    console.log('');
    console.log('🎉 Super Admin créé avec succès !');
    console.log('');
    console.log('📋 Tes identifiants :');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Mot de passe: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('🌐 Tu peux maintenant te connecter sur http://localhost:5173/');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);

    if (error.code === 'auth/email-already-in-use') {
      console.log('');
      console.log('ℹ️  Ce compte existe déjà. Tu peux te connecter directement :');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Mot de passe: ${ADMIN_PASSWORD}`);
      console.log('   URL: http://localhost:5173/');
    }

    process.exit(1);
  }
}

createSuperAdmin();
