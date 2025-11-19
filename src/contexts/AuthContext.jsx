import { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../utils/api';
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
   * Connexion avec email et mot de passe
   */
  async function signIn(email, password) {
    try {
      const response = await apiClient.login(email, password);

      setCurrentUser({
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
      });

      setUserRole(response.user.role);

      if (response.user.etablissement_id) {
        // Récupère les données de l'établissement si besoin
        try {
          const etablissement = await apiClient.getEtablissement(response.user.etablissement_id);

          // Mapper modules (backend) vers modulesActifs (frontend)
          const etablissementMapped = {
            ...etablissement,
            modulesActifs: Array.isArray(etablissement.modules)
              ? etablissement.modules
              : (typeof etablissement.modules === 'string'
                  ? JSON.parse(etablissement.modules)
                  : [])
          };

          setUserEtablissement(etablissementMapped);
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'établissement:', error);
        }
      } else {
        setUserEtablissement(null);
      }

      return response;
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
      await apiClient.logout();
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
   * Note: Cette fonction n'est plus nécessaire avec le nouveau backend
   * La création d'utilisateur se fait maintenant via l'API établissements
   */
  async function createAdminEtablissement(email, password, etablissementData) {
    console.warn('createAdminEtablissement: Cette fonction est obsolète avec le nouveau backend');
    throw new Error('Utilisez l\'API établissements pour créer un établissement et son admin');
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
    return userRole === ROLES.SUPER_ADMIN || userRole === 'super_admin';
  }

  /**
   * Vérifie si l'utilisateur est admin établissement
   */
  function isAdminEtablissement() {
    return userRole === ROLES.ADMIN_ETABLISSEMENT ||
           userRole === 'admin_etablissement' ||
           userRole === ROLES.RESPONSABLE ||
           userRole === 'responsable';
  }

  // Vérifie le token au chargement et récupère les infos utilisateur
  useEffect(() => {
    const token = apiClient.getToken();

    if (token) {
      // Le token existe, récupérer les données utilisateur
      async function loadUser() {
        try {
          const response = await apiClient.getMe();

          setCurrentUser({
            id: response.user.id,
            email: response.user.email,
            name: response.user.name,
          });

          setUserRole(response.user.role);

          if (response.user.etablissement_id) {
            try {
              const etablissement = await apiClient.getEtablissement(response.user.etablissement_id);

              // Mapper modules (backend) vers modulesActifs (frontend)
              const etablissementMapped = {
                ...etablissement,
                modulesActifs: Array.isArray(etablissement.modules)
                  ? etablissement.modules
                  : (typeof etablissement.modules === 'string'
                      ? JSON.parse(etablissement.modules)
                      : [])
              };

              setUserEtablissement(etablissementMapped);
            } catch (error) {
              console.error('Erreur lors de la récupération de l\'établissement:', error);
            }
          }
        } catch (error) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', error);
          // Token invalide, le supprimer
          apiClient.setToken(null);
        } finally {
          setLoading(false);
        }
      }

      loadUser();
    } else {
      setLoading(false);
    }
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
