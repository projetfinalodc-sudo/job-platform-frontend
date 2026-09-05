import axiosClient from './axiosClient';

const statsService = {
  getStatsPubliques: () =>
    axiosClient.get('/public/stats').then((res) => res.data.data),
};

export default statsService;
