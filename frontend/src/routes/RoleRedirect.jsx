import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../features/auth/authStore.js';

// Instradamento della root "/" in base al ruolo dell'utente autenticato.
export default function RoleRedirect() {
  const user = useAuthStore((state) => state.user);
  return <Navigate to={user?.role === 'administrator' ? '/admin' : '/customer'} replace />;
}
