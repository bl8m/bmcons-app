import axios from 'axios';
import { useAuthStore } from '../features/auth/authStore.js';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // invia il cookie httpOnly del refresh token
});

// Allega l'access token corrente ad ogni richiesta.
api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// In caso di 401, prova una sola volta a rinnovare l'access token
// tramite il refresh token (cookie httpOnly) prima di arrendersi.
let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Se a fallire con 401 è la stessa chiamata di refresh (es. nessun
    // refresh token valido, come al primo avvio senza sessione), non va
    // ritentata: altrimenti richiamerebbe se stessa e resterebbe in deadlock
    // (la promise non si risolverebbe mai), bloccando initialize() in eterno.
    const isRefreshCall = originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status !== 401 || originalRequest._retry || isRefreshCall) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;

    try {
      refreshPromise ??= useAuthStore.getState().refreshAccessToken();
      await refreshPromise;
      refreshPromise = null;

      const { accessToken } = useAuthStore.getState();
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      useAuthStore.getState().clearSession();
      return Promise.reject(refreshError);
    }
  }
);
