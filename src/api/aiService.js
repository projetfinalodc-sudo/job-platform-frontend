import axiosClient from './axiosClient';

const aiService = {
  genererLettreMotivation: (offreId) =>
    axiosClient
      .post('/ai/lettre-motivation', { offreId })
      .then((res) => res.data.data.lettre),
};

export default aiService;
