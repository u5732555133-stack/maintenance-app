import { useState, useEffect } from 'react';
import { isConfigured, initializeFirebaseApps } from './utils/firebase-dynamic';
import SetupWizard from './components/Setup/SetupWizard';
import App from './App';
import Loader from './components/Shared/Loader';

/**
 * Composant qui gère l'initialisation de l'application
 * Affiche le Setup Wizard si Firebase n'est pas configuré
 */
export default function AppInitializer() {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkConfiguration();
  }, []);

  async function checkConfiguration() {
    try {
      // Vérifie si l'app est configurée
      const isConfiguredResult = isConfigured();

      if (isConfiguredResult) {
        // Initialise Firebase
        initializeFirebaseApps();
        setConfigured(true);
      } else {
        setConfigured(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSetupComplete() {
    // Recharge la page pour réinitialiser l'app avec la nouvelle config
    window.location.reload();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader text="Initialisation de l'application..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Erreur d'initialisation
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => {
                localStorage.removeItem('firebase_zones_config');
                window.location.reload();
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Réinitialiser la configuration
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!configured) {
    // Affiche le Setup Wizard
    return <SetupWizard onComplete={handleSetupComplete} />;
  }

  // App configurée, affiche l'application normale
  return <App />;
}
