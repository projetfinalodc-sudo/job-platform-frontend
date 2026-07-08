import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Injecte automatiquement le token JWT sur chaque requête sortante
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jpg_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepte les réponses pour gérer la session expirée globalement,
// sans devoir répéter cette logique dans chaque page.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const dejaSurLogin = window.location.pathname === '/login';
      localStorage.removeItem('jpg_token');
      localStorage.removeItem('jpg_user');
      if (!dejaSurLogin) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extrait un message d'erreur exploitable depuis une erreur Axios,
 * en tenant compte de l'enveloppe ApiResponse du backend
 * ({ success, message, data, errors, code }).
 */
export function extraireErreur(error) {
  const data = error.response?.data;
  return {
    message: data?.message || "Une erreur est survenue. Veuillez réessayer.",
    code: data?.code || null,
    errors: data?.errors || null,
    status: error.response?.status || null,
  };
}

export default axiosClient;
