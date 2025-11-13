import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { getFirestoreForZone } from '../../utils/firebase';
import { calculateNextDate, formatDate } from '../../utils/helpers';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Card from '../Shared/Card';
import Loader from '../Shared/Loader';

export default function ConfirmMaintenance() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenData, setTokenData] = useState(null);
  const [ficheData, setFicheData] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    dateRealisation: new Date().toISOString().split('T')[0],
    commentaire: '',
  });

  useEffect(() => {
    validateToken();
  }, [token]);

  async function validateToken() {
    try {
      // Cherche le token dans toutes les zones
      let tokenDoc = null;
      let zone = null;

      for (const currentZone of ['zone1', 'zone2', 'zone3', 'zone4']) {
        const db = getFirestoreForZone(currentZone);
        const docRef = doc(db, 'confirmationTokens', token);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          tokenDoc = docSnap;
          zone = currentZone;
          break;
        }
      }

      if (!tokenDoc) {
        setError('Lien de confirmation invalide ou expiré');
        setLoading(false);
        return;
      }

      const data = tokenDoc.data();

      // Vérifie si le token est expiré
      if (data.expiresAt && data.expiresAt.toDate() < new Date()) {
        setError('Ce lien de confirmation a expiré');
        setLoading(false);
        return;
      }

      setTokenData({ ...data, zone });

      // Récupère les données de la fiche
      if (data.ficheId) {
        const ficheDoc = await data.ficheId.get();
        if (ficheDoc.exists()) {
          setFicheData({
            id: ficheDoc.id,
            ...ficheDoc.data(),
          });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error);
      setError('Erreur lors de la validation du lien');
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
    setError('');

    try {
      const db = getFirestoreForZone(tokenData.zone);
      const dateRealisation = new Date(formData.dateRealisation);

      // Calcule la prochaine date
      const nextDate = calculateNextDate(dateRealisation, ficheData.frequenceMois);

      // Met à jour la fiche
      await updateDoc(tokenData.ficheId, {
        statut: 'realise',
        dernierEnvoi: dateRealisation,
        prochainEnvoi: nextDate,
        updatedAt: new Date(),
      });

      // Ajoute à l'historique
      await addDoc(
        collection(db, `etablissements/${tokenData.etablissementId}/historique`),
        {
          ficheId: tokenData.ficheId,
          dateRealisation: dateRealisation,
          commentaire: formData.commentaire,
          confirmedAt: new Date(),
        }
      );

      // Supprime le token (déjà utilisé)
      // Note: On pourrait aussi le garder pour tracking, à décider
      // await deleteDoc(doc(db, 'confirmationTokens', token));

      setSuccess(true);
    } catch (error) {
      console.error('Erreur lors de la confirmation:', error);
      setError('Erreur lors de la confirmation. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader text="Validation du lien..." />
      </div>
    );
  }

  if (error && !tokenData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Lien invalide
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
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
            <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Maintenance confirmée !
            </h2>
            <p className="text-gray-600 mb-6">
              Merci d'avoir confirmé la réalisation de la maintenance. La prochaine échéance a été automatiquement calculée.
            </p>
            <div className="bg-green-50 rounded-lg p-4 text-left">
              <p className="text-sm text-green-900">
                <span className="font-medium">Prochaine maintenance :</span>{' '}
                {formatDate(calculateNextDate(new Date(formData.dateRealisation), ficheData.frequenceMois))}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Confirmer la maintenance réalisée
          </h1>
          <p className="text-gray-600">
            Merci de confirmer la réalisation de la maintenance suivante :
          </p>
        </div>

        {ficheData && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              {ficheData.nomTache}
            </h3>
            {ficheData.urlPdf && (
              <a
                href={ficheData.urlPdf}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                📄 Voir la fiche technique
              </a>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Date de réalisation"
            type="date"
            value={formData.dateRealisation}
            onChange={(e) => setFormData({ ...formData, dateRealisation: e.target.value })}
            required
          />

          <div className="mb-4">
            <label className="label">
              Commentaire (optionnel)
            </label>
            <textarea
              className="input"
              rows="4"
              value={formData.commentaire}
              onChange={(e) => setFormData({ ...formData, commentaire: e.target.value })}
              placeholder="Ajoutez un commentaire si nécessaire..."
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <Button type="submit" loading={submitting} className="w-full">
            Confirmer la maintenance
          </Button>
        </form>
      </Card>
    </div>
  );
}
