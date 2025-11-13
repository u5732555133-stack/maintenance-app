// Script pour initialiser Firestore avec le Super Admin
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

// Configuration Firebase Zone 1
const firebaseConfig = {
  apiKey: "AIzaSyDjBnGtyG-s6go-htxQhjUoHTm-qor7byw",
  authDomain: "maintenance-zone1.firebaseapp.com",
  projectId: "maintenance-zone1",
  storageBucket: "maintenance-zone1.firebasestorage.app",
  messagingSenderId: "705088600833",
  appId: "1:705088600833:web:a00966180d42bce4fd3900",
  measurementId: "G-MLSRQLQLW7"
};

const ADMIN_EMAIL = "brianskuratko@gmail.com";
const ADMIN_PASSWORD = "Ingodwetrust";
const ADMIN_NAME = "Brian Skuratko";

async function initFirestore() {
  try {
    console.log('🚀 Initialisation de Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('🔐 Connexion avec le compte admin...');
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const uid = userCredential.user.uid;

    console.log(`✅ Connecté ! UID: ${uid}`);
    console.log('');
    console.log('📝 Création du document Super Admin dans Firestore...');

    // Crée le document superAdmin
    await setDoc(doc(db, 'superAdmins', uid), {
      email: ADMIN_EMAIL,
      name: ADMIN_NAME,
      createdAt: new Date(),
    });

    console.log('✅ Document superAdmin créé !');
    console.log('');
    console.log('🎉 Firestore initialisé avec succès !');
    console.log('');
    console.log('📋 Tu peux maintenant te connecter sur http://localhost:5173/ avec :');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Mot de passe: ${ADMIN_PASSWORD}`);
    console.log('');
    console.log('✨ Après connexion, tu pourras créer des établissements !');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'auth/wrong-password') {
      console.log('');
      console.log('⚠️  Le mot de passe ne correspond pas.');
      console.log('Vérifie que le compte existe dans Firebase Authentication.');
    } else if (error.code === 'auth/user-not-found') {
      console.log('');
      console.log('⚠️  Le compte n\'existe pas dans Firebase Authentication.');
      console.log('Va sur Firebase Console > Authentication > Users');
      console.log('Et crée le compte avec cet email et mot de passe.');
    }

    process.exit(1);
  }
}

initFirestore();
