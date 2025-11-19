import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import { JOURS_SEMAINE, ROUTES } from '../../utils/constants';
import Navbar from '../Shared/Navbar';
import Card from '../Shared/Card';
import Loader from '../Shared/Loader';

export default function CalendrierReunions() {
  const { userEtablissement } = useAuth();
  const [reunions, setReunions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (userEtablissement) {
      fetchReunions();
    }
  }, [userEtablissement]);

  async function fetchReunions() {
    try {
      const reunionsData = await apiClient.getReunions(userEtablissement.id);
      // Filtrer seulement les réunions actives
      setReunions(reunionsData.filter(r => r.actif));
    } catch (error) {
      console.error('Erreur lors de la récupération des réunions:', error);
      alert('Erreur lors du chargement des réunions');
    } finally {
      setLoading(false);
    }
  }

  function getJourLabel(jourSemaine) {
    const jour = JOURS_SEMAINE.find(j => j.value === jourSemaine);
    return jour ? jour.label.substring(0, 3) : '';
  }

  // Obtenir les réunions pour un jour donné
  function getReunionsForDay(date) {
    const dayOfWeek = date.getDay();
    return reunions.filter(r => r.jour_semaine === dayOfWeek);
  }

  // Générer les jours du mois
  function getDaysInMonth() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days = [];

    // Ajouter les jours vides au début
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Ajouter tous les jours du mois
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  }

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  const days = getDaysInMonth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Calendrier des réunions</h1>
            <Link to={ROUTES.ADMIN_REUNIONS}>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                ← Retour à la liste
              </button>
            </Link>
          </div>

          {loading ? (
            <Loader text="Chargement du calendrier..." />
          ) : (
            <Card>
              {/* Navigation mois */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={previousMonth}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  ← Mois précédent
                </button>

                <h2 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>

                <button
                  onClick={nextMonth}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Mois suivant →
                </button>
              </div>

              {/* Calendrier */}
              <div className="grid grid-cols-7 gap-2">
                {/* En-têtes jours */}
                {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                  <div key={day} className="text-center font-semibold text-sm text-gray-700 py-2">
                    {day}
                  </div>
                ))}

                {/* Jours du mois */}
                {days.map((date, index) => {
                  const dayReunions = date ? getReunionsForDay(date) : [];
                  const isToday = date && date.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border rounded-lg ${
                        date ? 'bg-white' : 'bg-gray-50'
                      } ${isToday ? 'ring-2 ring-primary-500' : ''}`}
                    >
                      {date && (
                        <>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {date.getDate()}
                          </div>

                          {dayReunions.length > 0 && (
                            <div className="space-y-1">
                              {dayReunions.map((reunion) => (
                                <div
                                  key={reunion.id}
                                  className="text-xs p-1 bg-primary-100 text-primary-800 rounded truncate"
                                  title={`${reunion.nom}\n${reunion.heure_debut?.substring(0, 5)} - ${reunion.heure_fin?.substring(0, 5)}`}
                                >
                                  <div className="font-medium truncate">{reunion.nom}</div>
                                  <div className="text-primary-600">
                                    {reunion.heure_debut?.substring(0, 5)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Légende */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Réunions récurrentes :</h3>
                <div className="space-y-2">
                  {reunions.map((reunion) => (
                    <div key={reunion.id} className="flex items-center gap-3 text-sm">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <div>
                        <span className="font-medium">{reunion.nom}</span>
                        <span className="text-gray-600"> - {getJourLabel(reunion.jour_semaine)} {reunion.heure_debut?.substring(0, 5)}</span>
                        {reunion.url_visio && (
                          <a
                            href={reunion.url_visio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-primary-600 hover:text-primary-700"
                          >
                            🎥 Visio
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
