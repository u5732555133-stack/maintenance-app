import App from './App';

/**
 * Composant qui gère l'initialisation de l'application
 * NOTE: Firebase a été remplacé par une API RPI, ce composant ne fait plus qu'afficher l'App
 */
export default function AppInitializer() {
  // Firebase désactivé - utilise maintenant l'API RPI
  return <App />;
}
