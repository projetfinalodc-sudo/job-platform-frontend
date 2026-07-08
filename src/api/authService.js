import axiosClient from './axiosClient';

const authService = {
  // Renvoie { id, email, message } — le compte n'est PAS connecté automatiquement
  register: (payload) =>
    axiosClient.post('/auth/register', payload).then((res) => res.data.data),

  // Renvoie { token, id, nom, prenom, email, role }
  login: (email, motDePasse) =>
    axiosClient
      .post('/auth/login', { email, motDePasse })
      .then((res) => res.data.data),

  activate: (token) =>
    axiosClient.get('/auth/activate', { params: { token } }).then((res) => res.data),

  resendActivation: (email) =>
    axiosClient.post('/auth/resend-activation', { email }).then((res) => res.data),
};

export default authService;
