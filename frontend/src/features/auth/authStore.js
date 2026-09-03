import { create } from 'zustand';
import { api } from '../../lib/axios.js';

// L'access token vive solo in memoria (mai in localStorage) per limitare
// l'esposizione a XSS; la persistenza della sessione tra reload è affidata
// al refresh token in cookie httpOnly, tramite initialize().
export const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isInitialized: false,
  isLoading: false,

  login: async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    set({ user: data.user, accessToken: data.accessToken });
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      get().clearSession();
    }
  },

  refreshAccessToken: async () => {
    const { data } = await api.post('/auth/refresh');
    set({ user: data.user, accessToken: data.accessToken });
    return data.accessToken;
  },

  // Da chiamare all'avvio dell'app per ripristinare la sessione da un
  // eventuale refresh token cookie valido, senza richiedere un nuovo login.
  initialize: async () => {
    set({ isLoading: true });
    try {
      await get().refreshAccessToken();
    } catch {
      get().clearSession();
    } finally {
      set({ isInitialized: true, isLoading: false });
    }
  },

  clearSession: () => set({ user: null, accessToken: null }),
}));
