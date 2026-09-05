import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * Protège une route : redirige vers /login si non connecté (en mémorisant la
 * page d'origine pour y revenir après connexion), ou vers /403 si l'utilisateur
 * est connecté mais n'a pas le rôle requis.
 *
 * Usage : <PrivateRoute role="CANDIDAT"><MesCandidatures /></PrivateRoute>
 * Sans prop "role", accepte n'importe quel utilisateur connecté.
 */
function PrivateRoute({ children, role }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

export default PrivateRoute;
