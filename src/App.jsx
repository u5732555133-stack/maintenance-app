import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';

// Super Admin
import SuperAdminDashboard from './components/SuperAdmin/Dashboard';
import Etablissements from './components/SuperAdmin/Etablissements';

// Admin Établissement
import AdminDashboard from './components/AdminEtablissement/Dashboard';
import FichesList from './components/AdminEtablissement/FichesList';
import ContactsList from './components/AdminEtablissement/ContactsList';
import UsersList from './components/AdminEtablissement/UsersList';
import Historique from './components/AdminEtablissement/Historique';
import Settings from './components/AdminEtablissement/Settings';

// Public
import ConfirmMaintenance from './components/Public/ConfirmMaintenance';

import { ROLES, ROUTES } from './utils/constants';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Route publique */}
          <Route path={ROUTES.LOGIN} element={<Login />} />
          <Route path="/confirm/:token" element={<ConfirmMaintenance />} />

          {/* Routes Super Admin */}
          <Route
            path={ROUTES.SUPER_ADMIN_DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <SuperAdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.SUPER_ADMIN_ETABLISSEMENTS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Etablissements />
              </ProtectedRoute>
            }
          />

          {/* Routes Admin Établissement */}
          <Route
            path={ROUTES.ADMIN_DASHBOARD}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN_ETABLISSEMENT]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_FICHES}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN_ETABLISSEMENT]}>
                <FichesList />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_CONTACTS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN_ETABLISSEMENT]}>
                <ContactsList />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_USERS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN_ETABLISSEMENT]}>
                <UsersList />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_HISTORIQUE}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN_ETABLISSEMENT]}>
                <Historique />
              </ProtectedRoute>
            }
          />
          <Route
            path={ROUTES.ADMIN_SETTINGS}
            element={
              <ProtectedRoute allowedRoles={[ROLES.ADMIN_ETABLISSEMENT]}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
          <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
