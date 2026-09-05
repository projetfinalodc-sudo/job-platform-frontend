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

function viderSessionEtRediriger() {
  localStorage.removeItem('jpg_token');
  localStorage.removeItem('jpg_refresh_token');
  localStorage.removeItem('jpg_user');
  const dejaSurLogin = window.location.pathname === '/login';
  if (!dejaSurLogin) {
    window.location.href = '/login';
  }
}

// Mutualise les rafraîchissements concurrents : si plusieurs requêtes échouent
// en même temps (ex: plusieurs appels API au chargement d'une page), une seule
// vraie requête de refresh part vers le backend au lieu d'une par requête.
let refreshEnCours = null;

function rafraichirLesTokens() {
  const refreshToken = localStorage.getItem('jpg_refresh_token');
  if (!refreshToken) {
    return Promise.reject(new Error('Aucun refresh token disponible'));
  }

  if (!refreshEnCours) {
    refreshEnCours = axios
      .post(`${API_URL}/auth/refresh-token`, { refreshToken })
      .then((res) => res.data.data)
      .finally(() => {
        refreshEnCours = null;
      });
  }
  return refreshEnCours;
}

// Intercepte les réponses :
// - 401 sur une route protégée → tente un rafraîchissement silencieux du token,
//   puis rejoue la requête originale automatiquement (l'utilisateur ne voit rien).
// - Si le rafraîchissement échoue aussi → session réellement expirée, déconnexion.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const requeteOriginale = error.config;
    const statut = error.response?.status;
    const estRouteAuth = requeteOriginale?.url?.includes('/auth/');

    if (statut === 401 && !estRouteAuth && !requeteOriginale._dejaRejouee) {
      requeteOriginale._dejaRejouee = true;
      try {
        const nouveauxTokens = await rafraichirLesTokens();
        localStorage.setItem('jpg_token', nouveauxTokens.token);
        localStorage.setItem('jpg_refresh_token', nouveauxTokens.refreshToken);
        requeteOriginale.headers.Authorization = `Bearer ${nouveauxTokens.token}`;
        return axiosClient(requeteOriginale);
      } catch (erreurRefresh) {
        viderSessionEtRediriger();
        return Promise.reject(erreurRefresh);
      }
    }

    if (statut === 401) {
      viderSessionEtRediriger();
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
