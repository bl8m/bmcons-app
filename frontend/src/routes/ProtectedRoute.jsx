import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore.js';
import Spinner from '../components/Spinner.jsx';

// Uso:
//   <Route element={<ProtectedRoute />}>...</Route>                 -> richiede solo il login
//   <Route element={<ProtectedRoute role="administrator" />}>...</Route> -> richiede anche il ruolo
export default function ProtectedRoute({ role }) {
  const { user, isInitialized, isLoading } = useAuthStore();
  const location = useLocation();

  if (!isInitialized || isLoading) {
    return <Spinner className="h-screen" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
