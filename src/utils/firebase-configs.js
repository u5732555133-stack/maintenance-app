/**
 * Configurations Firebase pré-définies
 * Importées depuis FIREBASECONFIG.ts pour faciliter la configuration automatique
 */

export const predefinedConfigs = {
  zone1: {
    name: 'Nord / Île-de-France',
    config: {
      apiKey: "AIzaSyDjBnGtyG-s6go-htxQhjUoHTm-qor7byw",
      authDomain: "maintenance-zone1.firebaseapp.com",
      projectId: "maintenance-zone1",
      storageBucket: "maintenance-zone1.firebasestorage.app",
      messagingSenderId: "705088600833",
      appId: "1:705088600833:web:a00966180d42bce4fd3900",
      measurementId: "G-MLSRQLQLW7"
    }
  },
  zone2: {
    name: 'Est / Grand Est',
    config: {
      apiKey: "AIzaSyAfNvT_MWqboE0vD07BiCc7PdUq--saoXk",
      authDomain: "maintenance-zone2.firebaseapp.com",
      projectId: "maintenance-zone2",
      storageBucket: "maintenance-zone2.firebasestorage.app",
      messagingSenderId: "380419772825",
      appId: "1:380419772825:web:f822e1ef90384c8dcf0308",
      measurementId: "G-3B1TTRVV4N"
    }
  },
  zone3: {
    name: 'Ouest / Bretagne / Pays de Loire',
    config: {
      apiKey: "AIzaSyAyt3NOJ8Is66cEjiM-aLeOI0BhHiXVYho",
      authDomain: "maintenance-zone3.firebaseapp.com",
      projectId: "maintenance-zone3",
      storageBucket: "maintenance-zone3.firebasestorage.app",
      messagingSenderId: "662402186163",
      appId: "1:662402186163:web:0e77b72393e8bc289469c6",
      measurementId: "G-DSMGYSCWVJ"
    }
  },
  zone4: {
    name: 'Sud / PACA / Occitanie',
    config: {
      apiKey: "AIzaSyDI8otKp5tZJcLYcZY3-crPEfcdPy33I0c",
      authDomain: "maintenance-zone4.firebaseapp.com",
      projectId: "maintenance-zone4",
      storageBucket: "maintenance-zone4.firebasestorage.app",
      messagingSenderId: "401587012447",
      appId: "1:401587012447:web:f119d416d0212c38a92cea",
      measurementId: "G-0V3ZPZTF7C"
    }
  }
};

/**
 * Applique la configuration automatique pour toutes les zones
 * @returns {Object} Configuration complète pour localStorage
 */
export function applyAutoConfiguration() {
  const config = {};

  Object.entries(predefinedConfigs).forEach(([zoneKey, zoneData]) => {
    config[zoneKey] = {
      name: zoneData.name,
      configured: true,
      config: zoneData.config
    };
  });

  return config;
}
