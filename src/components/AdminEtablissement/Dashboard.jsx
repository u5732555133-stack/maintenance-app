import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { getFirestoreForZone } from '../../utils/firebase';
import Navbar from '../Shared/Navbar';
import Card from '../Shared/Card';
import Loader from '../Shared/Loader';
import { formatDate, isLate } from '../../utils/helpers';

export default function AdminDashboard() {
  const { userEtablissement } = useAuth();
  const [stats, setStats] = useState({
    totalFiches: 0,
    fichesEnAttente: 0,
    fichesEnRetard: 0,
    totalContacts: 0,
  });
  const [prochaineFiches, setProchaineFiches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userEtablissement) {
      fetchDashboardData();
    }
  }, [userEtablissement]);

  async function fetchDashboardData() {
    try {
      const db = getFirestoreForZone(userEtablissement.zone || 'zone1');
      const etablissementId = userEtablissement.id;

      // Récupère les fiches
      const fichesSnap = await getDocs(
        collection(db, `etablissements/${etablissementId}/fiches`)
      );

      let totalFiches = 0;
      let fichesEnAttente = 0;
      let fichesEnRetard = 0;
      const prochaines = [];

      fichesSnap.forEach((doc) => {
        const fiche = doc.data();
        totalFiches++;

        if (fiche.statut === 'en_attente') {
          fichesEnAttente++;
        }

        if (fiche.prochainEnvoi) {
          const prochainDate = fiche.prochainEnvoi.toDate ? fiche.prochainEnvoi.toDate() : new Date(fiche.prochainEnvoi);
          if (isLate(prochainDate)) {
            fichesEnRetard++;
          }

          prochaines.push({
            id: doc.id,
            ...fiche,
            prochainEnvoiDate: prochainDate,
          });
        }
      });

      // Trie par date (les plus proches en premier)
      prochaines.sort((a, b) => a.prochainEnvoiDate - b.prochainEnvoiDate);

      // Récupère les contacts
      const contactsSnap = await getDocs(
        collection(db, `etablissements/${etablissementId}/contacts`)
      );

      setStats({
        totalFiches,
        fichesEnAttente,
        fichesEnRetard,
        totalContacts: contactsSnap.size,
      });

      setProchaineFiches(prochaines.slice(0, 5)); // Top 5
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h1>
          {userEtablissement && (
            <p className="text-gray-600 mb-8">{userEtablissement.nom}</p>
          )}

          {loading ? (
            <Loader text="Chargement du tableau de bord..." />
          ) : (
            <>
              {/* Statistiques */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">Fiches totales</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalFiches}</p>
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
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">En attente</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.fichesEnAttente}</p>
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
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">En retard</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.fichesEnRetard}</p>
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="flex items-center">
                    <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-5">
                      <p className="text-sm font-medium text-gray-500">Contacts</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Prochaines maintenances */}
              <Card title="Prochaines maintenances">
                {prochaineFiches.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucune maintenance planifiée
                  </p>
                ) : (
                  <div className="space-y-3">
                    {prochaineFiches.map((fiche) => (
                      <div
                        key={fiche.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{fiche.nomTache}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(fiche.prochainEnvoiDate)}
                          </p>
                        </div>
                        {isLate(fiche.prochainEnvoiDate) && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            En retard
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
