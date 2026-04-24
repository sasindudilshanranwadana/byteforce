import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FullPageSpinner } from './ui/Spinner';

/**
 * Protects a route.
 * @param {string[]} roles - if provided, user must have one of these roles
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && profile && !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
