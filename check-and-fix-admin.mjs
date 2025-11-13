// Script pour vérifier et corriger le compte Super Admin
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDjBnGtyG-s6go-htxQhjUoHTm-qor7byw",
  authDomain: "maintenance-zone1.firebaseapp.com",
  projectId: "maintenance-zone1",
  storageBucket: "maintenance-zone1.firebasestorage.app",
  messagingSenderId: "705088600833",
  appId: "1:705088600833:web:a00966180d42bce4fd3900",
  measurementId: "G-MLSRQLQLW7"
};

const ADMIN_NAME = "Brian Skuratko";
const ADMIN_EMAIL = "brianskuratko@gmail.com";
const ADMIN_PASSWORD = "Ingodwetrust";

async function checkAndFixAdmin() {
  try {
    console.log('🔍 Vérification du compte Super Admin...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Connecte-toi pour obtenir l'UID
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    const uid = userCredential.user.uid;

    console.log(`✅ Compte trouvé dans Firebase Auth`);
    console.log(`   UID: ${uid}`);

    // Vérifie si le document Firestore existe
    const adminDoc = await getDoc(doc(db, 'superAdmins', uid));

    if (adminDoc.exists()) {
      console.log('✅ Document Firestore existe');
      console.log('   Données:', adminDoc.data());
      console.log('');
      console.log('🎉 Tout est bon ! Tu peux te connecter :');
    } else {
      console.log('⚠️  Document Firestore manquant, création...');

      await setDoc(doc(db, 'superAdmins', uid), {
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        createdAt: new Date(),
      });

      console.log('✅ Document Firestore créé');
      console.log('');
      console.log('🎉 Compte Super Admin corrigé ! Tu peux te connecter :');
    }

    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Mot de passe: ${ADMIN_PASSWORD}`);
    console.log('   URL: http://localhost:5173/');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);

    if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
      console.log('');
      console.log('⚠️  Les identifiants ne correspondent pas.');
      console.log('Tu dois peut-être utiliser un autre mot de passe ou créer un nouveau compte.');
    }

    process.exit(1);
  }
}

checkAndFixAdmin();
