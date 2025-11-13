// Script pour tester le flux complet de l'application
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore';

// Configuration Zone 1
const firebaseConfigZone1 = {
  apiKey: "AIzaSyDjBnGtyG-s6go-htxQhjUoHTm-qor7byw",
  authDomain: "maintenance-zone1.firebaseapp.com",
  projectId: "maintenance-zone1",
  storageBucket: "maintenance-zone1.firebasestorage.app",
  messagingSenderId: "705088600833",
  appId: "1:705088600833:web:a00966180d42bce4fd3900"
};

const TEST_EMAIL = "test@etablissement.com";
const TEST_PASSWORD = "Test123456";

async function testCompleteFlow() {
  console.log('🧪 Test complet du flux de l\'application\n');
  console.log('=' .repeat(60) + '\n');

  try {
    const app = initializeApp(firebaseConfigZone1, 'testCompleteApp');
    const auth = getAuth(app);
    const db = getFirestore(app);

    // ========================================================================
    // ÉTAPE 1: Connexion avec le compte établissement
    // ========================================================================
    console.log('📝 ÉTAPE 1: Connexion au compte établissement');
    console.log('-'.repeat(60));

    const userCredential = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
    const uid = userCredential.user.uid;

    console.log(`✅ Connexion réussie`);
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   UID: ${uid}\n`);

    // ========================================================================
    // ÉTAPE 2: Récupération des données utilisateur
    // ========================================================================
    console.log('📝 ÉTAPE 2: Récupération des données utilisateur');
    console.log('-'.repeat(60));

    const userDoc = await getDoc(doc(db, 'users', uid));

    if (!userDoc.exists()) {
      throw new Error('❌ Document utilisateur introuvable !');
    }

    const userData = userDoc.data();
    console.log(`✅ Données utilisateur trouvées:`);
    console.log(`   Rôle: ${userData.role}`);
    console.log(`   Établissement ID: ${userData.etablissementId}`);
    console.log(`   Zone de données: ${userData.dataZone}\n`);

    // ========================================================================
    // ÉTAPE 3: Récupération des données de l'établissement
    // ========================================================================
    console.log('📝 ÉTAPE 3: Récupération des données de l\'établissement');
    console.log('-'.repeat(60));

    const etablissementDoc = await getDoc(
      doc(db, 'etablissements', userData.etablissementId)
    );

    if (!etablissementDoc.exists()) {
      throw new Error('❌ Établissement introuvable !');
    }

    const etablissement = etablissementDoc.data();
    console.log(`✅ Établissement trouvé:`);
    console.log(`   Nom: ${etablissement.nom}`);
    console.log(`   Adresse: ${etablissement.adresse}`);
    console.log(`   Ville: ${etablissement.codePostal} ${etablissement.ville}`);
    console.log(`   Zone: ${etablissement.zone}\n`);

    // ========================================================================
    // ÉTAPE 4: Vérification de l'accès aux contacts
    // ========================================================================
    console.log('📝 ÉTAPE 4: Vérification de l\'accès aux contacts');
    console.log('-'.repeat(60));

    const contactsSnap = await getDocs(
      collection(db, `etablissements/${userData.etablissementId}/contacts`)
    );

    console.log(`✅ Accès aux contacts: OK`);
    console.log(`   Nombre de contacts: ${contactsSnap.size}`);

    if (contactsSnap.size > 0) {
      console.log(`   Liste des contacts:`);
      contactsSnap.forEach((doc) => {
        const contact = doc.data();
        console.log(`     - ${contact.nom} (${contact.email})`);
      });
    }
    console.log('');

    // ========================================================================
    // ÉTAPE 5: Vérification de l'accès aux fiches
    // ========================================================================
    console.log('📝 ÉTAPE 5: Vérification de l\'accès aux fiches de maintenance');
    console.log('-'.repeat(60));

    const fichesSnap = await getDocs(
      collection(db, `etablissements/${userData.etablissementId}/fiches`)
    );

    console.log(`✅ Accès aux fiches: OK`);
    console.log(`   Nombre de fiches: ${fichesSnap.size}`);

    if (fichesSnap.size > 0) {
      console.log(`   Liste des fiches:`);
      fichesSnap.forEach((doc) => {
        const fiche = doc.data();
        console.log(`     - ${fiche.nomTache} (${fiche.statut})`);
      });
    }
    console.log('');

    // ========================================================================
    // ÉTAPE 6: Test de création d'un contact
    // ========================================================================
    console.log('📝 ÉTAPE 6: Test de création d\'un contact');
    console.log('-'.repeat(60));

    const testContact = {
      nom: 'Contact Test',
      email: 'contact.test@example.com',
      telephone: '0123456789',
      fonction: 'Technicien',
      createdAt: new Date(),
    };

    const contactRef = await addDoc(
      collection(db, `etablissements/${userData.etablissementId}/contacts`),
      testContact
    );

    console.log(`✅ Contact de test créé`);
    console.log(`   ID: ${contactRef.id}`);
    console.log(`   Nom: ${testContact.nom}\n`);

    // ========================================================================
    // ÉTAPE 7: Test de création d'une fiche
    // ========================================================================
    console.log('📝 ÉTAPE 7: Test de création d\'une fiche de maintenance');
    console.log('-'.repeat(60));

    const testFiche = {
      nomTache: 'Fiche Test',
      urlPdf: 'https://example.com/fiche-test.pdf',
      frequenceMois: 6,
      prochainEnvoi: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      dernierEnvoi: null,
      responsableNom: 'Jean Dupont',
      responsableEmail: 'jean.dupont@example.com',
      responsableAdjointNom: '',
      responsableAdjointEmail: '',
      contactIds: [contactRef.id],
      commentaire: 'Fiche de test créée automatiquement',
      statut: 'en_attente',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const ficheRef = await addDoc(
      collection(db, `etablissements/${userData.etablissementId}/fiches`),
      testFiche
    );

    console.log(`✅ Fiche de test créée`);
    console.log(`   ID: ${ficheRef.id}`);
    console.log(`   Nom: ${testFiche.nomTache}`);
    console.log(`   Statut: ${testFiche.statut}\n`);

    // ========================================================================
    // ÉTAPE 8: Vérification du tableau de bord
    // ========================================================================
    console.log('📝 ÉTAPE 8: Statistiques du tableau de bord');
    console.log('-'.repeat(60));

    const finalContactsSnap = await getDocs(
      collection(db, `etablissements/${userData.etablissementId}/contacts`)
    );

    const finalFichesSnap = await getDocs(
      collection(db, `etablissements/${userData.etablissementId}/fiches`)
    );

    let fichesEnAttente = 0;
    let fichesEnRetard = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    finalFichesSnap.forEach((doc) => {
      const fiche = doc.data();
      if (fiche.statut === 'en_attente') fichesEnAttente++;

      if (fiche.prochainEnvoi) {
        const prochainDate = fiche.prochainEnvoi.toDate ? fiche.prochainEnvoi.toDate() : new Date(fiche.prochainEnvoi);
        if (prochainDate < today) fichesEnRetard++;
      }
    });

    console.log(`✅ Statistiques calculées:`);
    console.log(`   Total contacts: ${finalContactsSnap.size}`);
    console.log(`   Total fiches: ${finalFichesSnap.size}`);
    console.log(`   Fiches en attente: ${fichesEnAttente}`);
    console.log(`   Fiches en retard: ${fichesEnRetard}\n`);

    // ========================================================================
    // RÉSUMÉ FINAL
    // ========================================================================
    console.log('=' .repeat(60));
    console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
    console.log('=' .repeat(60));
    console.log('\n✅ L\'application est ENTIÈREMENT FONCTIONNELLE\n');
    console.log('Fonctionnalités testées et validées:');
    console.log('  ✓ Connexion avec compte établissement');
    console.log('  ✓ Récupération des données utilisateur');
    console.log('  ✓ Récupération des données établissement');
    console.log('  ✓ Accès et lecture des contacts');
    console.log('  ✓ Accès et lecture des fiches');
    console.log('  ✓ Création de contacts');
    console.log('  ✓ Création de fiches de maintenance');
    console.log('  ✓ Calcul des statistiques du dashboard\n');

    console.log('🌐 Tu peux maintenant te connecter sur http://localhost:5173');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Mot de passe: ${TEST_PASSWORD}\n`);

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('Code:', error.code);
    if (error.stack) {
      console.error('\nStack:', error.stack);
    }
    process.exit(1);
  }

  process.exit(0);
}

testCompleteFlow();
