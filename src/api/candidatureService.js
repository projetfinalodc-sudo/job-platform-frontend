import axiosClient from './axiosClient';

const candidatureService = {
  /**
   * Soumet une candidature complète.
   * @param {object} champs { offreId, cv, lettreMotivationFichier, lettreMotivationTexte, telephoneContact, dateDisponibilite }
   * @param {function} onProgress callback (pourcentage: number) pour la barre de progression
   */
  postuler: (champs, onProgress) => {
    const formData = new FormData();
    formData.append('offreId', champs.offreId);
    formData.append('cv', champs.cv);
    if (champs.lettreMotivationFichier) {
      formData.append('lettreMotivationFichier', champs.lettreMotivationFichier);
    }
    if (champs.lettreMotivationTexte) {
      formData.append('lettreMotivationTexte', champs.lettreMotivationTexte);
    }
    formData.append('telephoneContact', champs.telephoneContact);
    formData.append('dateDisponibilite', champs.dateDisponibilite);

    return axiosClient
      .post('/candidatures', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            onProgress(Math.round((evt.loaded * 100) / evt.total));
          }
        },
      })
      .then((res) => res.data.data);
  },

  getMesCandidatures: () =>
    axiosClient.get('/candidatures/mes-candidatures').then((res) => res.data.data),

  getCandidaturesOffre: (offreId) =>
    axiosClient
      .get(`/candidatures/offre/${offreId}`)
      .then((res) => res.data.data),

  changerStatut: (id, statut) =>
    axiosClient
      .put(`/candidatures/${id}/statut`, null, { params: { statut } })
      .then((res) => res.data.data),

  // Téléchargement scopé par ID de candidature (le backend vérifie que l'appelant
  // est soit le candidat propriétaire, soit le recruteur propriétaire de l'offre).
  telechargerCv: (candidatureId, nomFichierSuggere) =>
    telechargerBlob(`/candidatures/${candidatureId}/cv`, nomFichierSuggere || 'cv.pdf'),

  telechargerLettre: (candidatureId, nomFichierSuggere) =>
    telechargerBlob(`/candidatures/${candidatureId}/lettre`, nomFichierSuggere || 'lettre.pdf'),
};

function telechargerBlob(chemin, nomFichier) {
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

export default candidatureService;
