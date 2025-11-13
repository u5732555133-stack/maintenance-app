/**
 * Firebase Configuration - Static Configuration
 *
 * Ce fichier réexporte les fonctions de firebase-static.js
 * Configuration statique pour simplifier le déploiement
 */

export {
  isConfigured,
  initializeFirebaseApps,
  getZoneFromCodePostal,
  getAuthForZone,
  getFirestoreForZone,
  getFunctionsForZone,
  getAllFirestoreInstances,
  getConfiguredZones,
} from './firebase-static';

export { default } from './firebase-static';
