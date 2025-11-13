import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestoreForZone } from '../../utils/firebase';
import { SUCCESS_MESSAGES } from '../../utils/constants';
import Navbar from '../Shared/Navbar';
import Card from '../Shared/Card';
import Button from '../Shared/Button';
import Input from '../Shared/Input';

export default function Settings() {
  const { userEtablissement } = useAuth();
  const [activeTab, setActiveTab] = useState('info');
  const [emailProvider, setEmailProvider] = useState('resend');
  const [emailConfig, setEmailConfig] = useState({
    provider: '',
    fromEmail: '',
    fromName: '',
    resendApiKey: '',
    sendgridApiKey: '',
    smtpHost: '',
    smtpPort: '587',
    smtpUser: '',
    smtpPassword: '',
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (userEtablissement?.emailConfig) {
      setEmailConfig({
        provider: userEtablissement.emailConfig.provider || '',
        fromEmail: userEtablissement.emailConfig.fromEmail || '',
        fromName: userEtablissement.emailConfig.fromName || userEtablissement.nom,
        resendApiKey: userEtablissement.emailConfig.resendApiKey || '',
        sendgridApiKey: userEtablissement.emailConfig.sendgridApiKey || '',
        smtpHost: userEtablissement.emailConfig.smtpHost || '',
        smtpPort: userEtablissement.emailConfig.smtpPort || '587',
        smtpUser: userEtablissement.emailConfig.smtpUser || '',
        smtpPassword: userEtablissement.emailConfig.smtpPassword || '',
      });
      setEmailProvider(userEtablissement.emailConfig.provider || 'resend');
    } else {
      setEmailConfig(prev => ({
        ...prev,
        fromName: userEtablissement?.nom || '',
        fromEmail: userEtablissement?.adminEmail || '',
      }));
    }
  }, [userEtablissement]);

  async function handleSaveEmailConfig() {
    setSaving(true);
    try {
      const db = getFirestoreForZone(userEtablissement.zone || 'zone1');
      const etabRef = doc(db, 'etablissements', userEtablissement.id);

      const configToSave = {
        provider: emailProvider,
        fromEmail: emailConfig.fromEmail,
        fromName: emailConfig.fromName,
        configured: true,
        configuredAt: new Date(),
      };

      // Ajoute les clés spécifiques selon le provider
      if (emailProvider === 'resend') {
        configToSave.resendApiKey = emailConfig.resendApiKey;
      } else if (emailProvider === 'sendgrid') {
        configToSave.sendgridApiKey = emailConfig.sendgridApiKey;
      } else if (emailProvider === 'smtp') {
        configToSave.smtpHost = emailConfig.smtpHost;
        configToSave.smtpPort = emailConfig.smtpPort;
        configToSave.smtpUser = emailConfig.smtpUser;
        configToSave.smtpPassword = emailConfig.smtpPassword;
      }

      await updateDoc(etabRef, {
        emailConfig: configToSave,
      });

      alert(SUCCESS_MESSAGES.ETABLISSEMENT_UPDATED + '\n\nConfiguration email enregistrée avec succès!');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde: ' + error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleTestEmail() {
    setTesting(true);
    try {
      // TODO: Implémenter l'envoi d'email de test via Cloud Function
      alert('Fonctionnalité de test en cours de développement.\n\nL\'email sera envoyé lors du prochain envoi automatique.');
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors du test: ' + error.message);
    } finally {
      setTesting(false);
    }
  }

  const isConfigured = userEtablissement?.emailConfig?.configured;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Paramètres</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('info')}
                className={`${
                  activeTab === 'info'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Informations
              </button>
              <button
                onClick={() => setActiveTab('email')}
                className={`${
                  activeTab === 'email'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                Configuration Email
                {isConfigured && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    ✓
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('modules')}
                className={`${
                  activeTab === 'modules'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Modules
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'info' && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Informations de l'établissement
              </h2>
              {userEtablissement && (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Nom :</span>{' '}
                    <span className="text-gray-900">{userEtablissement.nom}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Adresse :</span>{' '}
                    <span className="text-gray-900">{userEtablissement.adresse}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Ville :</span>{' '}
                    <span className="text-gray-900">
                      {userEtablissement.codePostal} {userEtablissement.ville}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email administrateur :</span>{' '}
                    <span className="text-gray-900">{userEtablissement.adminEmail}</span>
                  </div>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              {/* Status */}
              {isConfigured ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-green-800 text-2xl">✓</span>
                    <div>
                      <h3 className="text-sm font-medium text-green-900">
                        Configuration email active
                      </h3>
                      <p className="text-sm text-green-700 mt-1">
                        Provider : {userEtablissement?.emailConfig?.provider?.toUpperCase()} •
                        De : {userEtablissement?.emailConfig?.fromEmail}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-800 text-2xl">⚠</span>
                    <div>
                      <h3 className="text-sm font-medium text-yellow-900">
                        Configuration email requise
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Configurez l'envoi d'emails pour envoyer les rappels de maintenance automatiquement.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Card>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Configuration de l'envoi d'emails
                </h2>

                <p className="text-sm text-gray-600 mb-6">
                  Choisissez votre provider d'envoi d'emails. Tous les options ci-dessous ont un plan gratuit.
                </p>

                {/* Provider Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Provider d'envoi
                  </label>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <button
                      type="button"
                      onClick={() => setEmailProvider('resend')}
                      className={`${
                        emailProvider === 'resend'
                          ? 'ring-2 ring-primary-500 border-primary-500'
                          : 'border-gray-300'
                      } relative rounded-lg border bg-white px-6 py-4 shadow-sm hover:border-gray-400 transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex flex-col text-left">
                          <span className="block text-sm font-medium text-gray-900">
                            Resend ⭐
                          </span>
                          <span className="mt-1 text-xs text-gray-500">
                            3000 emails/mois gratuits
                          </span>
                          <span className="mt-1 text-xs text-green-600 font-medium">
                            Recommandé
                          </span>
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmailProvider('sendgrid')}
                      className={`${
                        emailProvider === 'sendgrid'
                          ? 'ring-2 ring-primary-500 border-primary-500'
                          : 'border-gray-300'
                      } relative rounded-lg border bg-white px-6 py-4 shadow-sm hover:border-gray-400 transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex flex-col text-left">
                          <span className="block text-sm font-medium text-gray-900">
                            SendGrid
                          </span>
                          <span className="mt-1 text-xs text-gray-500">
                            100 emails/jour gratuits
                          </span>
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEmailProvider('smtp')}
                      className={`${
                        emailProvider === 'smtp'
                          ? 'ring-2 ring-primary-500 border-primary-500'
                          : 'border-gray-300'
                      } relative rounded-lg border bg-white px-6 py-4 shadow-sm hover:border-gray-400 transition-colors`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex flex-col text-left">
                          <span className="block text-sm font-medium text-gray-900">
                            SMTP (Gmail)
                          </span>
                          <span className="mt-1 text-xs text-gray-500">
                            Configuration manuelle
                          </span>
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Common Fields */}
                <div className="space-y-4 mb-6">
                  <Input
                    label="Email expéditeur"
                    type="email"
                    value={emailConfig.fromEmail}
                    onChange={(e) => setEmailConfig({ ...emailConfig, fromEmail: e.target.value })}
                    placeholder="noreply@votre-etablissement.fr"
                    required
                  />
                  <Input
                    label="Nom de l'expéditeur"
                    value={emailConfig.fromName}
                    onChange={(e) => setEmailConfig({ ...emailConfig, fromName: e.target.value })}
                    placeholder={userEtablissement?.nom || 'Mon Établissement'}
                    required
                  />
                </div>

                {/* Provider-specific fields */}
                {emailProvider === 'resend' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-900 mb-4">
                      <strong>Comment obtenir une clé API Resend :</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Créez un compte sur <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a> (gratuit)</li>
                        <li>Vérifiez votre domaine (ou utilisez leur domaine de test)</li>
                        <li>Copiez votre clé API depuis le dashboard</li>
                      </ol>
                    </div>
                    <Input
                      label="Clé API Resend"
                      type="password"
                      value={emailConfig.resendApiKey}
                      onChange={(e) => setEmailConfig({ ...emailConfig, resendApiKey: e.target.value })}
                      placeholder="re_xxxxxxxxxxxx"
                      required
                    />
                  </div>
                )}

                {emailProvider === 'sendgrid' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-900 mb-4">
                      <strong>Comment obtenir une clé API SendGrid :</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Créez un compte sur <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer" className="underline">sendgrid.com</a></li>
                        <li>Allez dans Settings → API Keys</li>
                        <li>Créez une nouvelle clé avec permissions "Mail Send"</li>
                      </ol>
                    </div>
                    <Input
                      label="Clé API SendGrid"
                      type="password"
                      value={emailConfig.sendgridApiKey}
                      onChange={(e) => setEmailConfig({ ...emailConfig, sendgridApiKey: e.target.value })}
                      placeholder="SG.xxxxxxxxxxxx"
                      required
                    />
                  </div>
                )}

                {emailProvider === 'smtp' && (
                  <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-900 mb-4">
                      <strong>Configuration SMTP Gmail :</strong>
                      <ol className="list-decimal list-inside mt-2 space-y-1">
                        <li>Activez la validation en 2 étapes sur votre compte Google</li>
                        <li>Générez un "Mot de passe d'application" dans les paramètres Google</li>
                        <li>Utilisez ce mot de passe d'application ci-dessous</li>
                      </ol>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Serveur SMTP"
                        value={emailConfig.smtpHost}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpHost: e.target.value })}
                        placeholder="smtp.gmail.com"
                        required
                      />
                      <Input
                        label="Port"
                        value={emailConfig.smtpPort}
                        onChange={(e) => setEmailConfig({ ...emailConfig, smtpPort: e.target.value })}
                        placeholder="587"
                        required
                      />
                    </div>
                    <Input
                      label="Utilisateur SMTP"
                      type="email"
                      value={emailConfig.smtpUser}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpUser: e.target.value })}
                      placeholder="votre-email@gmail.com"
                      required
                    />
                    <Input
                      label="Mot de passe SMTP"
                      type="password"
                      value={emailConfig.smtpPassword}
                      onChange={(e) => setEmailConfig({ ...emailConfig, smtpPassword: e.target.value })}
                      placeholder="Mot de passe d'application"
                      required
                    />
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <Button onClick={handleSaveEmailConfig} loading={saving}>
                    Enregistrer la configuration
                  </Button>
                  {isConfigured && (
                    <Button variant="secondary" onClick={handleTestEmail} loading={testing}>
                      Envoyer un email de test
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'modules' && (
            <Card>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Modules activés
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Les modules actifs pour votre établissement. Contactez votre administrateur pour en activer d'autres.
              </p>
              <div className="flex flex-wrap gap-2">
                {userEtablissement?.modulesActifs?.map((module) => (
                  <span
                    key={module}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                  >
                    {module.charAt(0).toUpperCase() + module.slice(1)}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
