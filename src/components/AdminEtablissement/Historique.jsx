import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate, formatDateTime } from '../../utils/helpers';
import Navbar from '../Shared/Navbar';
import Card from '../Shared/Card';
import Loader from '../Shared/Loader';

export default function Historique() {
  const { userEtablissement } = useAuth();
  const [historique, setHistorique] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEtablissement) {
      fetchHistorique();
    }
  }, [userEtablissement]);

  async function fetchHistorique() {
    try {
      // TODO: Implémenter l'historique avec PostgreSQL
      // Pour le moment, aucun historique n'est disponible
      setHistorique([]);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Historique des maintenances
          </h1>

          {loading ? (
            <Loader text="Chargement de l'historique..." />
          ) : historique.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-8">
                Aucun historique pour le moment.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {historique.map((item) => (
                <Card key={item.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {item.ficheData?.nomTache || 'Fiche supprimée'}
                        </h3>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Réalisé
                        </span>
                      </div>

                      <div className="space-y-1 text-sm text-gray-600">
                        {item.dateRealisation && (
                          <p>
                            <span className="font-medium">Date de réalisation :</span>{' '}
                            {formatDate(item.dateRealisation.toDate ? item.dateRealisation.toDate() : item.dateRealisation)}
                          </p>
                        )}
                        {item.confirmedAt && (
                          <p>
                            <span className="font-medium">Confirmé le :</span>{' '}
                            {formatDateTime(item.confirmedAt.toDate ? item.confirmedAt.toDate() : item.confirmedAt)}
                          </p>
                        )}
                        {item.dateEnvoi && (
                          <p>
                            <span className="font-medium">Email envoyé le :</span>{' '}
                            {formatDate(item.dateEnvoi.toDate ? item.dateEnvoi.toDate() : item.dateEnvoi)}
                          </p>
                        )}
                        {item.commentaire && (
                          <p className="mt-2">
                            <span className="font-medium">Commentaire :</span>{' '}
                            {item.commentaire}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
