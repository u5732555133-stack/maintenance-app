import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getAuthForZone, getFirestoreForZone } from '../utils/firebase';
import { ROLES } from '../utils/constants';

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userEtablissement, setUserEtablissement] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Récupère les données utilisateur depuis Firestore
   */
  async function fetchUserData(uid) {
    try {
      // Vérifie d'abord si c'est un super admin
      const superAdminDoc = await getDoc(doc(getFirestoreForZone('zone1'), 'superAdmins', uid));

      if (superAdminDoc.exists()) {
        const data = superAdminDoc.data();
        setUserRole(ROLES.SUPER_ADMIN);
        setUserEtablissement(null);
        return data;
      }

      // Sinon, cherche dans les utilisateurs (peut être dans n'importe quelle zone)
      // Pour simplifier, on cherche dans zone1 en premier
      // TODO: Optimiser en stockant la zone dans le custom claim
      const userDoc = await getDoc(doc(getFirestoreForZone('zone1'), 'users', uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserRole(data.role || ROLES.ADMIN_ETABLISSEMENT);

        if (data.etablissementId) {
          // Récupère les données de l'établissement
          const etablissementDoc = await getDoc(
            doc(getFirestoreForZone(data.zone || 'zone1'), 'etablissements', data.etablissementId)
          );

          if (etablissementDoc.exists()) {
            setUserEtablissement({
              id: etablissementDoc.id,
              ...etablissementDoc.data(),
            });
          }
        }

        return data;
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération des données utilisateur:', error);
      return null;
    }
  }

  /**
   * Connexion avec email et mot de passe
   * IMPORTANT: Auth toujours en zone1
   */
  async function signIn(email, password) {
    try {
      const auth = getAuthForZone('zone1');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await fetchUserData(userCredential.user.uid);
      return userCredential;
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  }

  /**
   * Déconnexion
   */
  async function signOut() {
    try {
      const auth = getAuthForZone('zone1');
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserRole(null);
      setUserEtablissement(null);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  }

  /**
   * Création d'un compte admin établissement (réservé au super admin)
   * IMPORTANT: Auth toujours en zone1, données dans la zone appropriée
   */
  async function createAdminEtablissement(email, password, etablissementData) {
    try {
      // Crée le compte Firebase Auth en ZONE1
      const auth = getAuthForZone('zone1');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Détermine la zone pour les DONNÉES selon le code postal
      const dataZone = etablissementData.zone || 'zone1';

      // Document utilisateur en ZONE1
      const dbAuth = getFirestoreForZone('zone1');
      await setDoc(doc(dbAuth, 'users', uid), {
        email,
        role: ROLES.ADMIN_ETABLISSEMENT,
        etablissementId: etablissementData.id,
        dataZone,
        createdAt: new Date(),
      });

      return userCredential;
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      throw error;
    }
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  function hasRole(role) {
    return userRole === role;
  }

  /**
   * Vérifie si l'utilisateur est super admin
   */
  function isSuperAdmin() {
    return userRole === ROLES.SUPER_ADMIN;
  }

  /**
   * Vérifie si l'utilisateur est admin établissement
   */
  function isAdminEtablissement() {
    return userRole === ROLES.ADMIN_ETABLISSEMENT;
  }

  // Observer les changements d'authentification
  // IMPORTANT: Auth toujours en zone1
  useEffect(() => {
    const auth = getAuthForZone('zone1');

    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);

      if (user) {
        setCurrentUser(user);
        await fetchUserData(user.uid);
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserEtablissement(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userEtablissement,
    loading,
    signIn,
    signOut,
    createAdminEtablissement,
    hasRole,
    isSuperAdmin,
    isAdminEtablissement,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
