import axiosClient from './axiosClient';

const notificationService = {
  getMesNotifications: () =>
    axiosClient.get('/notifications').then((res) => res.data.data),

  compterNonLues: () =>
    axiosClient.get('/notifications/non-lues/count').then((res) => res.data.data.count),

  marquerCommeLue: (id) =>
    axiosClient.put(`/notifications/${id}/lue`).then((res) => res.data.data),

  marquerToutesCommeLues: () =>
    axiosClient.put('/notifications/marquer-toutes-lues').then((res) => res.data),

  supprimer: (id) =>
    axiosClient.delete(`/notifications/${id}`).then((res) => res.data),
};

export default notificationService;
