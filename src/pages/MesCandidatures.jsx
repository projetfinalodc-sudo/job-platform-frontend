import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCalendar, FiClock } from 'react-icons/fi';
import candidatureService from '../api/candidatureService';
import { extraireErreur } from '../api/axiosClient';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUTS = {
  EN_ATTENTE: { label: 'En attente', badge: 'badge-amber' },
  VUE: { label: 'Vue par le recruteur', badge: 'badge-blue' },
  ACCEPTEE: { label: 'Acceptée', badge: 'badge-green' },
  REFUSEE: { label: 'Refusée', badge: 'badge-red' },
};

function MesCandidatures() {
  const [candidatures, setCandidatures] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    candidatureService.getMesCandidatures()
      .then(setCandidatures)
      .catch((error) => toast.error(extraireErreur(error).message))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <LoadingSpinner label="Chargement de vos candidatures…" />;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes candidatures</h1>
          <p className="page-subtitle">{candidatures.length} candidature(s) envoyée(s)</p>
        </div>
      </div>

      {candidatures.length === 0 ? (
        <EmptyState
          icon="📄"
          title="Aucune candidature envoyée"
          description="Parcourez les offres disponibles et postulez dès maintenant."
          action={<Link to="/offres" className="btn btn-primary">Voir les offres</Link>}
        />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Offre</th>
                <th>Entreprise</th>
                <th>Date d'envoi</th>
                <th>Disponibilité</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {candidatures.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/offres/${c.offreId}`} style={{ color: 'var(--slate-800)', fontWeight: 600, textDecoration: 'none' }}>
                      {c.titreOffre}
                    </Link>
                  </td>
                  <td>{c.entreprise}</td>
                  <td><FiCalendar /> {formaterDate(c.dateCandidature)}</td>
                  <td><FiClock /> {formaterDateSimple(c.dateDisponibilite)}</td>
                  <td>
                    <span className={`badge ${STATUTS[c.statut]?.badge || 'badge-gray'}`}>
                      {STATUTS[c.statut]?.label || c.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function formaterDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formaterDateSimple(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default MesCandidatures;
