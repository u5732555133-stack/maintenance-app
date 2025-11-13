import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAllFirestoreInstances } from '../../utils/firebase';
import Navbar from '../Shared/Navbar';
import Card from '../Shared/Card';
import Loader from '../Shared/Loader';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalEtablissements: 0,
    totalFiches: 0,
    fichesEnAttente: 0,
    fichesEnRetard: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      const allDbs = getAllFirestoreInstances();

      // Vérifie qu'il y a des instances Firestore
      if (!allDbs || Object.keys(allDbs).length === 0) {
        console.warn('Aucune instance Firestore disponible');
        setLoading(false);
        return;
      }

      let totalEtabs = 0;
      let totalFiches = 0;
      let fichesEnAttente = 0;
      let fichesEnRetard = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Parcourt toutes les zones
      for (const [zone, db] of Object.entries(allDbs)) {
        try {
          // Compte les établissements
          const etablissementsSnap = await getDocs(collection(db, 'etablissements'));
          totalEtabs += etablissementsSnap.size;

          // Parcourt chaque établissement pour compter les fiches
          for (const etabDoc of etablissementsSnap.docs) {
            const fichesSnap = await getDocs(
              collection(db, `etablissements/${etabDoc.id}/fiches`)
            );

            totalFiches += fichesSnap.size;

            fichesSnap.forEach((ficheDoc) => {
              const fiche = ficheDoc.data();
              if (fiche.statut === 'en_attente') {
                fichesEnAttente++;
              }
              if (fiche.prochainEnvoi && new Date(fiche.prochainEnvoi.seconds * 1000) < today) {
                fichesEnRetard++;
              }
            });
          }
        } catch (error) {
          // Ignore les erreurs de permissions pour les zones où l'admin n'existe pas encore
          console.log(`Zone ${zone}: pas encore d'établissements ou permissions manquantes`);
        }
      }

      setStats({
        totalEtablissements: totalEtabs,
        totalFiches,
        fichesEnAttente,
        fichesEnRetard,
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des stats:', error);
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
            Tableau de bord - Direction
          </h1>

          {loading ? (
            <Loader text="Chargement des statistiques..." />
          ) : (
            <>
              {/* Statistiques principales */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Établissements
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.totalEtablissements}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Fiches totales
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.totalFiches}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          En attente
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.fichesEnAttente}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-red-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          En retard
                        </dt>
                        <dd className="text-2xl font-bold text-gray-900">
                          {stats.fichesEnRetard}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Informations */}
              <Card title="Bienvenue">
                <p className="text-gray-600 mb-4">
                  Vous êtes connecté en tant qu'administrateur principal. Depuis ce tableau de bord, vous pouvez :
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Créer et gérer les établissements</li>
                  <li>Créer des comptes administrateurs pour chaque établissement</li>
                  <li>Consulter les statistiques globales</li>
                  <li>Superviser l'activité de tous les établissements</li>
                </ul>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
