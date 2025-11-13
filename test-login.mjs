// Script pour tester la connexion et vérifier les données utilisateur
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfigZone1 = {
  apiKey: "AIzaSyDjBnGtyG-s6go-htxQhjUoHTm-qor7byw",
  authDomain: "maintenance-zone1.firebaseapp.com",
  projectId: "maintenance-zone1",
  storageBucket: "maintenance-zone1.firebasestorage.app",
  messagingSenderId: "705088600833",
  appId: "1:705088600833:web:a00966180d42bce4fd3900"
};

async function testLogin(email, password) {
  console.log('🔍 Test de connexion pour:', email);
  console.log('='.repeat(60) + '\n');

  try {
    const app = initializeApp(firebaseConfigZone1, 'loginTest');
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Étape 1: Connexion
    console.log('📝 Étape 1: Tentative de connexion...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    console.log('✅ Connexion réussie !');
    console.log(`   UID: ${uid}`);
    console.log(`   Email: ${userCredential.user.email}\n`);

    // Étape 2: Vérifier si c'est un Super Admin
    console.log('📝 Étape 2: Vérification Super Admin...');
    const superAdminDoc = await getDoc(doc(db, 'superAdmins', uid));

    if (superAdminDoc.exists()) {
      console.log('✅ Utilisateur = SUPER ADMIN');
      console.log('   Données:', superAdminDoc.data());
      console.log('\n➡️  Devrait être redirigé vers /super-admin/dashboard\n');
      return;
    } else {
      console.log('❌ Pas un Super Admin\n');
    }

    // Étape 3: Vérifier si c'est un Admin Établissement
    console.log('📝 Étape 3: Vérification Admin Établissement...');
    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      console.error('❌ ERREUR: Document utilisateur introuvable !');
      console.error('   Le document users/' + uid + ' n\'existe pas');
      console.error('   C\'est le problème ! L\'utilisateur ne peut pas se connecter.\n');

      // Vérifier tous les documents users pour déboguer
      console.log('🔍 Vérification de tous les documents users...');
      const usersSnap = await getDocs(collection(db, 'users'));
      console.log(`   Nombre total de documents users: ${usersSnap.size}`);

      if (usersSnap.size > 0) {
        console.log('   Liste des documents:');
        usersSnap.forEach((doc) => {
          const data = doc.data();
          console.log(`     - ID: ${doc.id}`);
          console.log(`       Email: ${data.email}`);
          console.log(`       UID dans data: ${data.uid}`);
          console.log('');
        });
      }

      return;
    }

    const userData = userDoc.data();
    console.log('✅ Utilisateur = ADMIN ÉTABLISSEMENT');
    console.log('   Données utilisateur:');
    console.log('   - Rôle:', userData.role);
    console.log('   - Email:', userData.email);
    console.log('   - Établissement ID:', userData.etablissementId);
    console.log('   - Zone de données:', userData.dataZone);
    console.log('');

    // Étape 4: Vérifier l'établissement
    console.log('📝 Étape 4: Vérification de l\'établissement...');
    const etabDoc = await getDoc(doc(db, 'etablissements', userData.etablissementId));

    if (!etabDoc.exists()) {
      console.error('❌ ERREUR: Établissement introuvable !');
      return;
    }

    const etabData = etabDoc.data();
    console.log('✅ Établissement trouvé:');
    console.log('   - Nom:', etabData.nom);
    console.log('   - Adresse:', etabData.adresse);
    console.log('   - Ville:', etabData.codePostal, etabData.ville);
    console.log('   - Zone:', etabData.zone);
    console.log('');

    console.log('➡️  Devrait être redirigé vers /etablissement/dashboard\n');

    console.log('✅ TOUT EST OK ! L\'utilisateur devrait pouvoir se connecter.\n');

  } catch (error) {
    console.error('\n❌ ERREUR lors de la connexion:');
    console.error('   Code:', error.code);
    console.error('   Message:', error.message);

    if (error.code === 'auth/wrong-password') {
      console.error('\n   → Le mot de passe est incorrect');
    } else if (error.code === 'auth/user-not-found') {
      console.error('\n   → Aucun utilisateur avec cet email');
    } else if (error.code === 'auth/invalid-credential') {
      console.error('\n   → Email ou mot de passe invalide');
    }

    console.error('');
  }

  process.exit(0);
}

// Récupère les arguments en ligne de commande
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('Usage: node test-login.mjs <email> <mot-de-passe>');
  console.log('');
  console.log('Exemples:');
  console.log('  node test-login.mjs brianskuratko@gmail.com Ingodwetrust');
  console.log('  node test-login.mjs test@etablissement.com Test123456');
  process.exit(1);
}

testLogin(email, password);
