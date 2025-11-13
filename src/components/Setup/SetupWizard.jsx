import { useState } from 'react';
import Card from '../Shared/Card';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import { applyAutoConfiguration } from '../../utils/firebase-configs';

/**
 * Wizard de configuration simplifié
 * Le super admin rentre simplement les credentials Firebase pour chaque zone
 */
export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [zones, setZones] = useState({
    zone1: { name: 'Nord / Île-de-France', configured: false, config: null },
    zone2: { name: 'Est / Grand Est', configured: false, config: null },
    zone3: { name: 'Ouest / Bretagne / Pays de Loire', configured: false, config: null },
    zone4: { name: 'Sud / PACA / Occitanie', configured: false, config: null },
  });
  const [currentZone, setCurrentZone] = useState('zone1');
  const [formData, setFormData] = useState({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
  });

  function handleZoneConfig() {
    // Sauvegarde la config de la zone actuelle
    setZones((prev) => ({
      ...prev,
      [currentZone]: {
        ...prev[currentZone],
        configured: true,
        config: { ...formData },
      },
    }));

    // Passe à la zone suivante
    const zoneKeys = Object.keys(zones);
    const currentIndex = zoneKeys.indexOf(currentZone);

    if (currentIndex < zoneKeys.length - 1) {
      const nextZone = zoneKeys[currentIndex + 1];
      setCurrentZone(nextZone);
      setFormData({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      });
    } else {
      // Toutes les zones configurées
      setStep(3);
    }
  }

  function saveConfiguration() {
    // Sauvegarde la configuration dans localStorage
    localStorage.setItem('firebase_zones_config', JSON.stringify(zones));

    // Recharge l'app avec la nouvelle config
    onComplete();
  }

  function handleAutoConfiguration() {
    // Applique la configuration automatique depuis firebase-configs.js
    const autoConfig = applyAutoConfiguration();

    // Sauvegarde directement dans localStorage
    localStorage.setItem('firebase_zones_config', JSON.stringify(autoConfig));

    // Affiche une confirmation et recharge
    alert('✅ Configuration automatique appliquée ! Toutes les zones Firebase ont été configurées.');
    onComplete();
  }

  function skipZone() {
    alert('⚠️ Attention : Cette zone ne sera pas disponible. Vous pourrez la configurer plus tard dans les paramètres.');

    const zoneKeys = Object.keys(zones);
    const currentIndex = zoneKeys.indexOf(currentZone);

    if (currentIndex < zoneKeys.length - 1) {
      const nextZone = zoneKeys[currentIndex + 1];
      setCurrentZone(nextZone);
      setFormData({
        apiKey: '',
        authDomain: '',
        projectId: '',
        storageBucket: '',
        messagingSenderId: '',
        appId: '',
      });
    } else {
      setStep(3);
    }
  }

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🚀 Bienvenue dans l'installation !
            </h1>
            <p className="text-gray-600">
              Configuration rapide en 5 minutes. Nous allons configurer 4 zones Firebase pour gérer jusqu'à 3000 établissements gratuitement.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Ce dont vous avez besoin :</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>✅ 4 projets Firebase créés (gratuit sur firebase.google.com)</li>
              <li>✅ Les credentials de chaque projet (disponibles dans les paramètres)</li>
              <li>✅ 5 minutes de votre temps</li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>💡 Astuce :</strong> Ouvrez Firebase Console dans un autre onglet pour copier-coller les credentials facilement.
            </p>
          </div>

          <div className="space-y-3">
            <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleAutoConfiguration}>
              🚀 Configuration automatique (Recommandé)
            </Button>

            <Button className="w-full" onClick={() => setStep(2)}>
              Configuration manuelle
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => window.open('https://console.firebase.google.com/', '_blank')}
            >
              Ouvrir Firebase Console
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 2) {
    const configuredCount = Object.values(zones).filter(z => z.configured).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Configuration Zone {currentZone.slice(-1)}
              </h2>
              <span className="text-sm text-gray-600">
                {configuredCount} / 4 configurées
              </span>
            </div>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-4">
              <p className="font-medium text-primary-900 mb-1">
                {zones[currentZone].name}
              </p>
              <p className="text-sm text-primary-700">
                Cette zone couvrira environ 750 établissements dans cette région de France.
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all"
                style={{ width: `${(configuredCount / 4) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              📍 Comment trouver ces informations ?
            </h3>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Allez dans Firebase Console</li>
              <li>Sélectionnez votre projet (ex: maintenance-zone1)</li>
              <li>Cliquez sur l'icône ⚙️ {">"} Paramètres du projet</li>
              <li>Scrollez jusqu'à "Vos applications"</li>
              <li>Cliquez sur l'icône {"</>"} (Web)</li>
              <li>Copiez les valeurs du firebaseConfig</li>
            </ol>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleZoneConfig(); }} className="space-y-4">
            <Input
              label="API Key"
              placeholder="AIza..."
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              required
            />

            <Input
              label="Auth Domain"
              placeholder="maintenance-zone1.firebaseapp.com"
              value={formData.authDomain}
              onChange={(e) => setFormData({ ...formData, authDomain: e.target.value })}
              required
            />

            <Input
              label="Project ID"
              placeholder="maintenance-zone1"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              required
            />

            <Input
              label="Storage Bucket"
              placeholder="maintenance-zone1.appspot.com"
              value={formData.storageBucket}
              onChange={(e) => setFormData({ ...formData, storageBucket: e.target.value })}
              required
            />

            <Input
              label="Messaging Sender ID"
              placeholder="123456789"
              value={formData.messagingSenderId}
              onChange={(e) => setFormData({ ...formData, messagingSenderId: e.target.value })}
              required
            />

            <Input
              label="App ID"
              placeholder="1:123456789:web:abc123"
              value={formData.appId}
              onChange={(e) => setFormData({ ...formData, appId: e.target.value })}
              required
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {configuredCount === 3 ? 'Terminer' : 'Zone suivante →'}
              </Button>
              <Button type="button" variant="secondary" onClick={skipZone}>
                Passer
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  if (step === 3) {
    const configuredCount = Object.values(zones).filter(z => z.configured).length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Configuration terminée ! 🎉
            </h2>

            <p className="text-gray-600 mb-6">
              Vous avez configuré {configuredCount} zone{configuredCount > 1 ? 's' : ''} Firebase.
              L'application est prête à être utilisée !
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-3">✅ Zones configurées :</h3>
              <div className="space-y-2">
                {Object.entries(zones).map(([key, zone]) => (
                  <div key={key} className="flex items-center gap-3">
                    {zone.configured ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-gray-400">○</span>
                    )}
                    <span className={zone.configured ? 'text-gray-900' : 'text-gray-400'}>
                      {zone.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {configuredCount < 4 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  ⚠️ Certaines zones ne sont pas configurées. Vous pourrez les ajouter plus tard dans les paramètres.
                </p>
              </div>
            )}

            <Button onClick={saveConfiguration} className="w-full">
              Lancer l'application
            </Button>
          </div>
        </Card>
      </div>
    );
  }
}
