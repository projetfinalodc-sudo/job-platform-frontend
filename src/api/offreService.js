import axiosClient from './axiosClient';

const offreService = {
  getToutes: () => axiosClient.get('/offres').then((res) => res.data.data),

  getById: (id) => axiosClient.get(`/offres/${id}`).then((res) => res.data.data),

  rechercher: (keyword) =>
    axiosClient
      .get('/offres/recherche', { params: { keyword } })
      .then((res) => res.data.data),

  getMesOffres: () =>
    axiosClient.get('/offres/mes-offres').then((res) => res.data.data),

  creer: (payload) =>
    axiosClient.post('/offres', payload).then((res) => res.data.data),

  modifier: (id, payload) =>
    axiosClient.put(`/offres/${id}`, payload).then((res) => res.data.data),

  supprimer: (id) => axiosClient.delete(`/offres/${id}`).then((res) => res.data),
};

export default offreService;
