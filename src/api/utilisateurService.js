import axiosClient from './axiosClient';

function telechargerFichier(chemin, nomFichier) {
  return axiosClient.get(chemin, { responseType: 'blob' }).then((res) => {
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const lien = document.createElement('a');
    lien.href = url;
    lien.setAttribute('download', nomFichier);
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    window.URL.revokeObjectURL(url);
  });
}

const utilisateurService = {
  // Profil personnel
  getMonProfil: () => axiosClient.get('/profil').then((res) => res.data.data),

  modifierMonProfil: (payload) =>
    axiosClient.put('/profil', payload).then((res) => res.data.data),

  uploadCV: (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    return axiosClient
      .post('/candidat/cv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            onProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      })
      .then((res) => res.data.data);
  },

  // La route est protégée par JWT : on ne peut pas utiliser un simple <a href>,
  // il faut récupérer le fichier via Axios (qui injecte le token) puis déclencher
  // le téléchargement manuellement.
  telechargerCV: (fileName) => telechargerFichier(`/candidat/cv/${fileName}`, fileName),

  // Administration
  admin: {
    getTous: () =>
      axiosClient.get('/admin/utilisateurs').then((res) => res.data.data),

    getById: (id) =>
      axiosClient.get(`/admin/utilisateurs/${id}`).then((res) => res.data.data),

    creer: (payload) =>
      axiosClient.post('/admin/utilisateurs', payload).then((res) => res.data.data),

    modifier: (id, payload) =>
      axiosClient
        .put(`/admin/utilisateurs/${id}`, payload)
        .then((res) => res.data.data),

    changerStatut: (id, actif) =>
      axiosClient
        .patch(`/admin/utilisateurs/${id}/statut`, null, { params: { actif } })
        .then((res) => res.data.data),

    supprimer: (id) =>
      axiosClient.delete(`/admin/utilisateurs/${id}`).then((res) => res.data),
  },
};

export default utilisateurService;
