/**
 * Script pour ajouter le champ modulesActifs aux établissements existants
 */
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const FIREBASE_CONFIGS = {
  zone1: {
    apiKey: "AIzaSyDjBnGtyG-s6go-htxQhjUoHTm-qor7byw",
    authDomain: "maintenance-zone1.firebaseapp.com",
    projectId: "maintenance-zone1",
    storageBucket: "maintenance-zone1.firebasestorage.app",
    messagingSenderId: "705088600833",
    appId: "1:705088600833:web:a00966180d42bce4fd3900"
  },
  zone2: {
    apiKey: "AIzaSyAfNvT_MWqboE0vD07BiCc7PdUq--saoXk",
    authDomain: "maintenance-zone2.firebaseapp.com",
    projectId: "maintenance-zone2",
    storageBucket: "maintenance-zone2.firebasestorage.app",
    messagingSenderId: "380419772825",
    appId: "1:380419772825:web:f822e1ef90384c8dcf0308"
  },
  zone3: {
    apiKey: "AIzaSyAyt3NOJ8Is66cEjiM-aLeOI0BhHiXVYho",
    authDomain: "maintenance-zone3.firebaseapp.com",
    projectId: "maintenance-zone3",
    storageBucket: "maintenance-zone3.firebasestorage.app",
    messagingSenderId: "662402186163",
    appId: "1:662402186163:web:0e77b72393e8bc289469c6"
  },
  zone4: {
    apiKey: "AIzaSyDI8otKp5tZJcLYcZY3-crPEfcdPy33I0c",
    authDomain: "maintenance-zone4.firebaseapp.com",
    projectId: "maintenance-zone4",
    storageBucket: "maintenance-zone4.firebasestorage.app",
    messagingSenderId: "401587012447",
    appId: "1:401587012447:web:f119d416d0212c38a92cea"
  }
};

const ADMIN_EMAIL = "brianskuratko@gmail.com";
const ADMIN_PASSWORD = "Ingodwetrust";

async function updateEtablissementsInZone(zoneName, config) {
  try {
    console.log(`\n📍 Traitement ${zoneName}...`);

    const app = initializeApp(config, `update-${zoneName}`);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Connexion
    await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);

    // Récupère tous les établissements
    const snapshot = await getDocs(collection(db, 'etablissements'));

    if (snapshot.empty) {
      console.log(`   Aucun établissement dans ${zoneName}`);
      return;
    }

    console.log(`   Trouvé ${snapshot.size} établissement(s)`);

    // Met à jour chaque établissement
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      // Vérifie si modulesActifs existe déjà
      if (data.modulesActifs) {
        console.log(`   ✓ ${data.nom} - modulesActifs déjà configuré:`, data.modulesActifs);
      } else {
        // Ajoute modulesActifs par défaut avec le module maintenance
        await updateDoc(doc(db, 'etablissements', docSnap.id), {
          modulesActifs: ['maintenance']
        });
        console.log(`   ✅ ${data.nom} - modulesActifs ajouté: ['maintenance']`);
      }
    }

  } catch (error) {
    if (error.code === 'permission-denied') {
      console.log(`   ⚠️  ${zoneName} - Pas de permissions ou établissements`);
    } else {
      console.error(`   ❌ Erreur dans ${zoneName}:`, error.message);
    }
  }
}

async function main() {
  console.log('🔧 Mise à jour des établissements avec modulesActifs\n');
  console.log('Par défaut, tous les établissements auront le module "maintenance" actif.\n');

  for (const [zoneName, config] of Object.entries(FIREBASE_CONFIGS)) {
    await updateEtablissementsInZone(zoneName, config);
  }

  console.log('\n✨ Mise à jour terminée !');
  process.exit(0);
}

main();
