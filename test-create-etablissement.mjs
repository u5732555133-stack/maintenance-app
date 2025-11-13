// Script pour tester la création complète d'un établissement
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, doc, getDoc, setDoc } from 'firebase/firestore';

// Configuration Zone 1
const firebaseConfigZone1 = {
  apiKey: "AIzaSyDjBnGtyG-s6go-htxQhjUoHTm-qor7byw",
  authDomain: "maintenance-zone1.firebaseapp.com",
  projectId: "maintenance-zone1",
  storageBucket: "maintenance-zone1.firebasestorage.app",
  messagingSenderId: "705088600833",
  appId: "1:705088600833:web:a00966180d42bce4fd3900"
};

// Email et mot de passe pour le test
const TEST_EMAIL = "test@etablissement.com";
const TEST_PASSWORD = "Test123456";
const ETABLISSEMENT_NOM = "Test Établissement";
const ETABLISSEMENT_ADRESSE = "123 Rue Test";
const ETABLISSEMENT_CODE_POSTAL = "01000"; // Zone 1
const ETABLISSEMENT_VILLE = "Test Ville";

async function testCreateEtablissement() {
  console.log('🔧 Démarrage du test de création d\'établissement...\n');

  try {
    // Initialise Firebase
    const app = initializeApp(firebaseConfigZone1, 'testApp');
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log('✅ Firebase initialisé\n');

    // Étape 1: Créer le compte utilisateur
    console.log('📝 Étape 1: Création du compte admin...');
    console.log(`   Email: ${TEST_EMAIL}`);

    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
      console.log(`✅ Compte créé avec succès`);
      console.log(`   UID: ${userCredential.user.uid}\n`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`⚠️  Le compte existe déjà, tentative de connexion...`);
        userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
        console.log(`✅ Connexion réussie`);
        console.log(`   UID: ${userCredential.user.uid}\n`);
      } else {
        throw error;
      }
    }

    const uid = userCredential.user.uid;

    // Étape 2: Créer l'établissement dans Firestore
    console.log('📝 Étape 2: Création de l\'établissement dans Firestore...');
    const etablissementRef = await addDoc(collection(db, 'etablissements'), {
      nom: ETABLISSEMENT_NOM,
      adresse: ETABLISSEMENT_ADRESSE,
      codePostal: ETABLISSEMENT_CODE_POSTAL,
      ville: ETABLISSEMENT_VILLE,
      adminEmail: TEST_EMAIL,
      adminUid: uid,
      zone: 'zone1',
      createdAt: new Date(),
    });

    console.log(`✅ Établissement créé`);
    console.log(`   ID: ${etablissementRef.id}\n`);

    // Étape 3: Créer le document utilisateur
    console.log('📝 Étape 3: Création du document utilisateur...');
    // IMPORTANT: Utilise setDoc avec l'UID comme ID du document
    await setDoc(doc(db, 'users', uid), {
      uid: uid,
      email: TEST_EMAIL,
      role: 'admin_etablissement',
      etablissementId: etablissementRef.id,
      dataZone: 'zone1',
      createdAt: new Date(),
    });

    console.log(`✅ Document utilisateur créé avec UID: ${uid}\n`);

    // Étape 4: Vérifier que tout est bien créé
    console.log('🔍 Étape 4: Vérification...\n');

    // Vérifier l'établissement
    const etabDoc = await getDoc(doc(db, 'etablissements', etablissementRef.id));
    if (etabDoc.exists()) {
      console.log('✅ Établissement trouvé dans Firestore:');
      console.log(JSON.stringify(etabDoc.data(), null, 2));
      console.log('');
    } else {
      console.log('❌ Établissement NON trouvé dans Firestore\n');
    }

    // Déconnexion et reconnexion
    console.log('📝 Étape 5: Test de connexion...');
    await auth.signOut();
    console.log('   Déconnecté');

    const loginCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    console.log(`✅ Connexion réussie avec ${TEST_EMAIL}`);
    console.log(`   UID: ${loginCredential.user.uid}\n`);

    console.log('🎉 TOUS LES TESTS SONT PASSÉS !\n');
    console.log('Tu peux maintenant te connecter sur http://localhost:5173 avec:');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Mot de passe: ${TEST_PASSWORD}`);

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('Code:', error.code);
    console.error('\nStack:', error.stack);
    process.exit(1);
  }

  process.exit(0);
}

testCreateEtablissement();
