import axiosClient from './axiosClient';

const entretienService = {
  proposer: (candidatureId, payload) =>
    axiosClient
      .post(`/candidatures/${candidatureId}/entretien`, payload)
      .then((res) => res.data.data),

  consulter: (candidatureId) =>
    axiosClient
      .get(`/candidatures/${candidatureId}/entretien`)
      .then((res) => res.data.data)
      .catch((error) => {
        // Pas d'entretien programmé pour cette candidature = état normal, pas une erreur à afficher
        if (error.response?.status === 404) return null;
        throw error;
      }),

  repondre: (candidatureId, accepte) =>
    axiosClient
      .put(`/candidatures/${candidatureId}/entretien/reponse`, null, { params: { accepte } })
      .then((res) => res.data.data),

  annuler: (candidatureId) =>
    axiosClient.delete(`/candidatures/${candidatureId}/entretien`).then((res) => res.data),

  mesEntretiens: () =>
    axiosClient.get('/entretiens/mes-entretiens').then((res) => res.data.data),
};

export default entretienService;
