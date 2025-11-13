import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../utils/constants';

/**
 * Composant pour protéger les routes selon le rôle
 * @param {Object} props
 * @param {React.ReactNode} props.children - Composants enfants
 * @param {string[]} props.allowedRoles - Rôles autorisés
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirige vers le dashboard approprié selon le rôle
    if (userRole === 'super_admin') {
      return <Navigate to={ROUTES.SUPER_ADMIN_DASHBOARD} replace />;
    } else if (userRole === 'admin_etablissement') {
      return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
    } else {
      return <Navigate to={ROUTES.HOME} replace />;
    }
  }

  return children;
}
