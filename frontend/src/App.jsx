import { useEffect } from 'react';
import { useAuthStore } from './features/auth/authStore.js';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  const initialize = useAuthStore((state) => state.initialize);

  // Al primo caricamento tenta di ripristinare la sessione tramite il
  // refresh token (cookie httpOnly), evitando di richiedere un nuovo login
  // ad ogni refresh della pagina.
  useEffect(() => {
    initialize();
  }, [initialize]);

  return <AppRoutes />;
}
