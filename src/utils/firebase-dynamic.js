import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

/**
 * Initialisation dynamique de Firebase depuis localStorage
 * Les credentials sont configurés via le Setup Wizard
 */

// Charge la configuration depuis localStorage
function loadFirebaseConfig() {
  const savedConfig = localStorage.getItem('firebase_zones_config');

  if (!savedConfig) {
    return null;
  }

  try {
    return JSON.parse(savedConfig);
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration Firebase:', error);
    return null;
  }
}

// Vérifie si l'app est configurée
export function isConfigured() {
  const config = loadFirebaseConfig();
  if (!config) return false;

  // Vérifie qu'au moins une zone est configurée
  return Object.values(config).some(zone => zone.configured && zone.config);
}

// Initialise les apps Firebase
let apps = {};
let authInstances = {};
let firestoreInstances = {};
let functionsInstances = {};
let isInitialized = false;

export function initializeFirebaseApps() {
  // Évite la double initialisation (React StrictMode)
  if (isInitialized && Object.keys(apps).length > 0) {
    console.log('✅ Firebase déjà initialisé, réutilisation des instances');
    return { apps, authInstances, firestoreInstances, functionsInstances };
  }

  const zonesConfig = loadFirebaseConfig();

  if (!zonesConfig) {
    throw new Error('Configuration Firebase non trouvée. Veuillez exécuter le Setup Wizard.');
  }

  // Initialise chaque zone configurée
  Object.entries(zonesConfig).forEach(([zoneKey, zone]) => {
    if (zone.configured && zone.config) {
      try {
        // Vérifie si l'app existe déjà
        if (!apps[zoneKey]) {
          apps[zoneKey] = initializeApp(zone.config, zoneKey);
          authInstances[zoneKey] = getAuth(apps[zoneKey]);
          firestoreInstances[zoneKey] = getFirestore(apps[zoneKey]);
          functionsInstances[zoneKey] = getFunctions(apps[zoneKey], 'europe-west1');

          console.log(`✅ Firebase ${zoneKey} initialisé:`, zone.config.projectId);
        }
      } catch (error) {
        console.error(`❌ Erreur initialisation ${zoneKey}:`, error);
      }
    }
  });

  // Vérifie qu'au moins une zone est initialisée
  if (Object.keys(apps).length === 0) {
    throw new Error('Aucune zone Firebase n\'a pu être initialisée');
  }

  isInitialized = true;
  return { apps, authInstances, firestoreInstances, functionsInstances };
}

// Mapping des départements vers les zones
const ZONE_MAPPING = {
  zone1: ['75', '77', '78', '91', '92', '93', '94', '95', '02', '59', '60', '62', '80'],
  zone2: ['08', '10', '51', '52', '54', '55', '57', '67', '68', '88', '21', '25', '39', '70', '90'],
  zone3: ['22', '29', '35', '56', '44', '49', '53', '72', '85', '14', '27', '50', '61', '76'],
  zone4: ['04', '05', '06', '13', '83', '84', '09', '11', '12', '30', '31', '32', '34', '46', '48', '65', '66', '81', '82'],
};

/**
 * Détermine la zone Firebase en fonction du code postal
 */
export function getZoneFromCodePostal(codePostal) {
  const departement = codePostal.substring(0, 2);

  for (const [zone, departements] of Object.entries(ZONE_MAPPING)) {
    if (departements.includes(departement)) {
      // Vérifie si cette zone est configurée
      if (firestoreInstances[zone]) {
        return zone;
      }
    }
  }

  // Retourne la première zone configurée par défaut
  const firstZone = Object.keys(firestoreInstances)[0];
  if (firstZone) {
    return firstZone;
  }

  throw new Error('Aucune zone Firebase configurée');
}

/**
 * Récupère l'instance Auth pour une zone spécifique
 */
export function getAuthForZone(zone = null) {
  if (!zone) {
    // Retourne la première zone configurée
    const firstZone = Object.keys(authInstances)[0];
    return authInstances[firstZone];
  }

  return authInstances[zone] || authInstances[Object.keys(authInstances)[0]];
}

/**
 * Récupère l'instance Firestore pour une zone spécifique
 */
export function getFirestoreForZone(zone = null) {
  if (!zone) {
    const firstZone = Object.keys(firestoreInstances)[0];
    return firestoreInstances[firstZone];
  }

  return firestoreInstances[zone] || firestoreInstances[Object.keys(firestoreInstances)[0]];
}

/**
 * Récupère l'instance Functions pour une zone spécifique
 */
export function getFunctionsForZone(zone = null) {
  if (!zone) {
    const firstZone = Object.keys(functionsInstances)[0];
    return functionsInstances[firstZone];
  }

  return functionsInstances[zone] || functionsInstances[Object.keys(functionsInstances)[0]];
}

/**
 * Pour le super admin : récupère toutes les instances Firestore
 */
export function getAllFirestoreInstances() {
  return firestoreInstances;
}

/**
 * Récupère la liste des zones configurées
 */
export function getConfiguredZones() {
  return Object.keys(firestoreInstances);
}

// Pas d'export direct de auth, db, functions car ils doivent être récupérés après init
// Utilise getAuthForZone(), getFirestoreForZone(), getFunctionsForZone() à la place

export default {
  isConfigured,
  initializeFirebaseApps,
  getZoneFromCodePostal,
  getAuthForZone,
  getFirestoreForZone,
  getFunctionsForZone,
  getAllFirestoreInstances,
  getConfiguredZones,
};
