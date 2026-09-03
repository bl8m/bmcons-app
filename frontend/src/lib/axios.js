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

    if (error.response?.status !== 401 || originalRequest._retry) {
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
