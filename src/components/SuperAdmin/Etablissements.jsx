import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestoreForZone, getZoneFromCodePostal, getAuthForZone } from '../../utils/firebase';
import { ZONES_LABELS, SUCCESS_MESSAGES } from '../../utils/constants';
import Navbar from '../Shared/Navbar';
import Card from '../Shared/Card';
import Button from '../Shared/Button';
import Input from '../Shared/Input';
import Select from '../Shared/Select';
import Loader from '../Shared/Loader';

export default function Etablissements() {
  const [etablissements, setEtablissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    adresse: '',
    codePostal: '',
    ville: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEtablissements();
  }, []);

  async function fetchEtablissements() {
    try {
      const allEtabs = [];

      // Récupère les établissements de toutes les zones
      for (const zone of ['zone1', 'zone2', 'zone3', 'zone4']) {
        try {
          const db = getFirestoreForZone(zone);
          const snapshot = await getDocs(collection(db, 'etablissements'));

          snapshot.forEach((doc) => {
            allEtabs.push({
              id: doc.id,
              zone,
              ...doc.data(),
            });
          });
        } catch (error) {
          // Ignore les erreurs de permissions pour les zones où l'admin n'existe pas encore
          console.log(`Zone ${zone}: pas encore d'établissements ou permissions manquantes`);
        }
      }

      setEtablissements(allEtabs);
    } catch (error) {
      console.error('Erreur lors de la récupération des établissements:', error);
    } finally {
      setLoading(false);
    }
  }

  function validateForm() {
    const newErrors = {};

    if (!formData.nom) newErrors.nom = 'Le nom est requis';
    if (!formData.adresse) newErrors.adresse = 'L\'adresse est requise';
    if (!formData.codePostal) newErrors.codePostal = 'Le code postal est requis';
    if (!formData.ville) newErrors.ville = 'La ville est requise';
    if (!formData.email) newErrors.email = 'L\'email est requis';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    setSubmitting(true);

    try {
      // Détermine la zone pour les DONNÉES selon le code postal
      const dataZone = getZoneFromCodePostal(formData.codePostal);
      console.log('📍 Zone pour les données:', dataZone);

      // IMPORTANT: Auth toujours en zone1, données dans la zone appropriée
      const authZone1 = getAuthForZone('zone1');
      const dbData = getFirestoreForZone(dataZone);
      const dbAuth = getFirestoreForZone('zone1'); // Pour le document users

      console.log('🔐 Création du compte admin en ZONE1:', formData.email);

      // Crée le compte admin en ZONE1
      const userCredential = await createUserWithEmailAndPassword(
        authZone1,
        formData.email,
        formData.password
      );

      console.log('✅ Compte créé en zone1, UID:', userCredential.user.uid);

      // Crée l'établissement dans la zone appropriée
      const etablissementRef = await addDoc(collection(dbData, 'etablissements'), {
        nom: formData.nom,
        adresse: formData.adresse,
        codePostal: formData.codePostal,
        ville: formData.ville,
        adminEmail: formData.email,
        adminUid: userCredential.user.uid,
        zone: dataZone,
        modulesActifs: ['maintenance'], // Module maintenance actif par défaut
        createdAt: new Date(),
      });

      console.log(`✅ Établissement créé en ${dataZone}, ID:`, etablissementRef.id);

      // Crée le document utilisateur en ZONE1 (avec référence à la zone des données)
      // IMPORTANT: Utilise setDoc avec l'UID comme ID du document
      await setDoc(doc(dbAuth, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: formData.email,
        role: 'admin_etablissement',
        etablissementId: etablissementRef.id,
        dataZone: dataZone, // Zone où se trouvent les données de l'établissement
        createdAt: new Date(),
      });

      console.log('✅ Document utilisateur créé en zone1 avec UID:', userCredential.user.uid);

      alert(SUCCESS_MESSAGES.ETABLISSEMENT_CREATED);
      setShowModal(false);
      setFormData({
        nom: '',
        adresse: '',
        codePostal: '',
        ville: '',
        email: '',
        password: '',
      });
      fetchEtablissements();
    } catch (error) {
      console.error('❌ Erreur lors de la création:', error);
      console.error('Code erreur:', error.code);
      console.error('Message:', error.message);
      alert('Erreur : ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(etablissement) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer ${etablissement.nom} ?`)) {
      return;
    }

    try {
      const db = getFirestoreForZone(etablissement.zone);
      await deleteDoc(doc(db, 'etablissements', etablissement.id));
      alert('Établissement supprimé');
      fetchEtablissements();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression');
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Établissements</h1>
            <Button onClick={() => setShowModal(true)}>
              + Nouvel établissement
            </Button>
          </div>

          {loading ? (
            <Loader text="Chargement des établissements..." />
          ) : etablissements.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-8">
                Aucun établissement pour le moment. Créez-en un pour commencer.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {etablissements.map((etab) => (
                <Card key={etab.id}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {etab.nom}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {etab.adresse}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        {etab.codePostal} {etab.ville}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800">
                        {ZONES_LABELS[etab.zone]}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 mb-2">
                      Admin : {etab.adminEmail}
                    </p>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(etab)}
                    >
                      Supprimer
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal création établissement */}
      {showModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-40" onClick={() => setShowModal(false)}></div>

            <div className="relative inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full z-50">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Nouvel établissement
                  </h3>

                  <Input
                    label="Nom de l'établissement"
                    value={formData.nom}
                    onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                    error={errors.nom}
                    required
                  />

                  <Input
                    label="Adresse"
                    value={formData.adresse}
                    onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                    error={errors.adresse}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Code postal"
                      value={formData.codePostal}
                      onChange={(e) => setFormData({ ...formData, codePostal: e.target.value })}
                      error={errors.codePostal}
                      required
                    />

                    <Input
                      label="Ville"
                      value={formData.ville}
                      onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                      error={errors.ville}
                      required
                    />
                  </div>

                  <hr className="my-4" />

                  <p className="text-sm text-gray-600 mb-4">
                    Compte administrateur de l'établissement
                  </p>

                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={errors.email}
                    required
                  />

                  <Input
                    label="Mot de passe"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    error={errors.password}
                    required
                  />
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                  <Button type="submit" loading={submitting}>
                    Créer l'établissement
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    type="button"
                  >
                    Annuler
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
