const admin = require('firebase-admin');

/**
 * Configuration multi-zones pour Firebase Admin SDK
 * Utilisé par les Cloud Functions pour accéder aux 4 zones séparées
 */

// Configurations pour les 4 zones
const zoneConfigs = {
  zone1: {
    projectId: 'maintenance-zone1',
    databaseURL: 'https://maintenance-zone1.firebaseio.com',
  },
  zone2: {
    projectId: 'maintenance-zone2',
    databaseURL: 'https://maintenance-zone2.firebaseio.com',
  },
  zone3: {
    projectId: 'maintenance-zone3',
    databaseURL: 'https://maintenance-zone3.firebaseio.com',
  },
  zone4: {
    projectId: 'maintenance-zone4',
    databaseURL: 'https://maintenance-zone4.firebaseio.com',
  },
};

// Apps initialisées pour chaque zone
const zoneApps = {};

/**
 * Initialise une app Firebase Admin pour une zone donnée
 * @param {string} zoneName - Nom de la zone (zone1, zone2, zone3, zone4)
 * @returns {admin.app.App} - App Firebase Admin
 */
function getZoneApp(zoneName) {
  if (!zoneConfigs[zoneName]) {
    throw new Error(`Zone inconnue: ${zoneName}`);
  }

  // Retourne l'app si déjà initialisée
  if (zoneApps[zoneName]) {
    return zoneApps[zoneName];
  }

  // Initialise l'app pour cette zone
  try {
    zoneApps[zoneName] = admin.initializeApp(
      {
        credential: admin.credential.applicationDefault(),
        ...zoneConfigs[zoneName],
      },
      zoneName
    );

    console.log(`✅ Firebase Admin initialisé pour ${zoneName}`);
    return zoneApps[zoneName];
  } catch (error) {
    console.error(`❌ Erreur initialisation ${zoneName}:`, error);
    throw error;
  }
}

/**
 * Récupère Firestore pour une zone donnée
 * @param {string} zoneName - Nom de la zone
 * @returns {admin.firestore.Firestore} - Instance Firestore
 */
function getZoneFirestore(zoneName) {
  const app = getZoneApp(zoneName);
  return admin.firestore(app);
}

/**
 * Récupère tous les établissements de toutes les zones
 * @returns {Promise<Array>} - Liste des établissements avec leur zone
 */
async function getAllEtablissements() {
  const etablissements = [];

  for (const zoneName of Object.keys(zoneConfigs)) {
    try {
      const db = getZoneFirestore(zoneName);
      const snapshot = await db.collection('etablissements').get();

      snapshot.forEach((doc) => {
        etablissements.push({
          id: doc.id,
          zone: zoneName,
          ...doc.data(),
        });
      });

      console.log(`📊 ${snapshot.size} établissements trouvés dans ${zoneName}`);
    } catch (error) {
      console.error(`❌ Erreur récupération établissements ${zoneName}:`, error);
    }
  }

  return etablissements;
}

module.exports = {
  getZoneApp,
  getZoneFirestore,
  getAllEtablissements,
  zoneConfigs,
};
