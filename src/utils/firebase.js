/**
 * Firebase Configuration - DEPRECATED
 *
 * This file is being phased out as we migrate to PostgreSQL on RPI.
 * Stub exports to prevent build errors while components are being migrated.
 */

// Stub functions that return empty values to satisfy imports
export const isConfigured = () => false;

export const initializeFirebaseApps = () => {
  console.warn('Firebase has been deprecated. Please use the API client instead.');
};

export const getZoneFromCodePostal = () => null;

export const getAuthForZone = () => null;

export const getFirestoreForZone = () => null;

export const getFunctionsForZone = () => null;

export const getAllFirestoreInstances = () => ({});

export const getConfiguredZones = () => [];

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
