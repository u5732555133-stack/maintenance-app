import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { getFirestoreForZone, getFunctionsForZone } from '../../utils/firebase';
import Button from '../Shared/Button';
import Card from '../Shared/Card';
import Input from '../Shared/Input';
import Loader from '../Shared/Loader';

export default function ConfirmMaintenance() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    dateRealisation: new Date().toISOString().split('T')[0], // Aujourd'hui par défaut
    commentaire: '',
  });

  useEffect(() => {
    validateToken();
  }, [token]);

  async function validateToken() {
    try {
      setLoading(true);
      setError(null);

      // Récupère le token depuis zone1 (centralisé)
      const db = getFirestoreForZone('zone1');
      const tokenDoc = await getDoc(doc(db, 'confirmationTokens', token));

      if (!tokenDoc.exists()) {
        setError('Token invalide ou expiré');
        return;
      }

      const data = tokenDoc.data();

      // Vérifie l'expiration
      const expiresAt = data.expiresAt?.toDate?.();
      if (expiresAt && expiresAt < new Date()) {
        setError('Ce lien de confirmation a expiré. Veuillez contacter votre administrateur.');
        return;
      }

      setTokenData(data);
    } catch (err) {
      console.error('Erreur validation token:', err);
      setError('Erreur lors de la validation du token');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!formData.dateRealisation) {
      setError('La date de réalisation est requise');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Appelle la Cloud Function confirmMaintenance (déployée en zone1)
      const functions = getFunctionsForZone('zone1');
      const confirmMaintenanceFn = httpsCallable(functions, 'confirmMaintenance');

      const result = await confirmMaintenanceFn({
        token: token,
        dateRealisation: formData.dateRealisation,
        commentaire: formData.commentaire,
      });

      console.log('✅ Maintenance confirmée:', result.data);

      setSuccess(true);
    } catch (err) {
      console.error('Erreur confirmation:', err);

      if (err.code === 'functions/not-found') {
        setError('Token invalide ou expiré');
      } else if (err.code === 'functions/failed-precondition') {
        setError('Ce lien de confirmation a expiré');
      } else {
        setError(err.message || 'Erreur lors de la confirmation');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader text="Chargement..." />
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Confirmation réussie
            </h2>
            <p className="text-gray-600 mb-2">
              Merci d'avoir confirmé la réalisation de la maintenance !
            </p>
            <p className="text-sm text-gray-500">
              Les informations ont été enregistrées avec succès.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-primary-100 mb-4">
            <svg
              className="h-8 w-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirmation de Maintenance
          </h1>
          <p className="text-gray-600">
            Veuillez confirmer la réalisation de la tâche suivante
          </p>
        </div>

        {/* Informations de la tâche */}
        <Card className="mb-6">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {tokenData?.nomTache}
            </h2>
          </div>

          <div className="space-y-3">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-gray-400 mr-3 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Établissement</p>
                <p className="text-sm text-gray-500">{tokenData?.etablissementNom || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-gray-400 mr-3 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-gray-700">Date d'envoi</p>
                <p className="text-sm text-gray-500">
                  {tokenData?.createdAt?.toDate?.()?.toLocaleDateString?.('fr-FR') || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Formulaire de confirmation */}
        <Card>
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la réalisation
            </h3>

            <Input
              label="Date de réalisation"
              type="date"
              value={formData.dateRealisation}
              onChange={(e) =>
                setFormData({ ...formData, dateRealisation: e.target.value })
              }
              required
              max={new Date().toISOString().split('T')[0]}
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire (optionnel)
              </label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ajoutez des remarques sur la réalisation de cette tâche..."
                value={formData.commentaire}
                onChange={(e) =>
                  setFormData({ ...formData, commentaire: e.target.value })
                }
              />
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" loading={submitting} className="flex-1">
                Confirmer la réalisation
              </Button>
            </div>

            <p className="mt-4 text-xs text-gray-500 text-center">
              En confirmant, vous attestez que cette tâche de maintenance a bien été réalisée à la date indiquée.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
