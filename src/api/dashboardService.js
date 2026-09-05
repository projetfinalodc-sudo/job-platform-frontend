import axiosClient from './axiosClient';

const dashboardService = {
  getDashboardCandidat: () =>
    axiosClient.get('/dashboard/candidat').then((res) => res.data.data),

  getDashboardRecruteur: () =>
    axiosClient.get('/dashboard/recruteur').then((res) => res.data.data),
};

export default dashboardService;
