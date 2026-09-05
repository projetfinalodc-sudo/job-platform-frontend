import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlusCircle, FiEdit2, FiTrash2, FiUsers, FiMapPin } from 'react-icons/fi';
import offreService from '../api/offreService';
import { extraireErreur } from '../api/axiosClient';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';
import CandidaturesModal from '../components/CandidaturesModal';

const STATUT_BADGE = {
  ACTIVE: 'badge-green',
  FERMEE: 'badge-gray',
  EXPIREE: 'badge-red',
};
const STATUT_LABEL = {
  ACTIVE: 'Active',
  FERMEE: 'Fermée',
  EXPIREE: 'Expirée',
};

function MesOffres() {
  const [offres, setOffres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [offreASupprimer, setOffreASupprimer] = useState(null);
  const [offreCandidatures, setOffreCandidatures] = useState(null);

  useEffect(() => {
    chargerOffres();
  }, []);

  const chargerOffres = () => {
    setChargement(true);
    offreService.getMesOffres()
      .then(setOffres)
      .catch((error) => toast.error(extraireErreur(error).message))
      .finally(() => setChargement(false));
  };

  const confirmerSuppression = async () => {
    try {
      await offreService.supprimer(offreASupprimer.id);
      setOffres((liste) => liste.filter((o) => o.id !== offreASupprimer.id));
      toast.success('Offre supprimée !');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setOffreASupprimer(null);
    }
  };

  if (chargement) return <LoadingSpinner label="Chargement de vos offres…" />;

  const totalCandidatures = offres.reduce((acc, o) => acc + (o.nombreCandidatures || 0), 0);
  const offresActives = offres.filter((o) => o.statut === 'ACTIVE').length;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes offres</h1>
          <p className="page-subtitle">Cliquez sur une offre pour consulter ses candidatures et y répondre</p>
        </div>
        <Link to="/creer-offre" className="btn btn-primary">
          <FiPlusCircle /> Publier une offre
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Offres publiées</span>
            <div className="stat-icon blue">📋</div>
          </div>
          <div className="stat-value">{offres.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Offres actives</span>
            <div className="stat-icon green">✅</div>
          </div>
          <div className="stat-value">{offresActives}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Candidatures reçues</span>
            <div className="stat-icon violet">👥</div>
          </div>
          <div className="stat-value">{totalCandidatures}</div>
        </div>
      </div>

      {offres.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Aucune offre publiée"
          description="Publiez votre première offre pour commencer à recevoir des candidatures."
          action={<Link to="/creer-offre" className="btn btn-primary">Publier une offre</Link>}
        />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Offre</th>
                <th>Localisation</th>
                <th>Statut</th>
                <th>Candidatures</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {offres.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => setOffreCandidatures(o)}
                  style={{ cursor: 'pointer' }}
                  title="Cliquer pour voir les candidatures reçues"
                >
                  <td style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{o.titre}</td>
                  <td><FiMapPin /> {o.localisation}</td>
                  <td>
                    <span className={`badge ${STATUT_BADGE[o.statut] || 'badge-gray'}`}>
                      {STATUT_LABEL[o.statut] || o.statut}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-violet">
                      <FiUsers /> {o.nombreCandidatures || 0}
                    </span>
                  </td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <Link to={`/mes-offres/${o.id}/modifier`} className="btn btn-ghost btn-sm">
                        <FiEdit2 />
                      </Link>
                      <button className="btn btn-ghost btn-sm" onClick={() => setOffreASupprimer(o)}>
                        <FiTrash2 color="var(--red)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {offreASupprimer && (
        <ConfirmModal
          titre="Supprimer cette offre ?"
          message={`"${offreASupprimer.titre}" sera définitivement supprimée, ainsi que les candidatures associées.`}
          confirmLabel="Supprimer"
          onConfirm={confirmerSuppression}
          onCancel={() => setOffreASupprimer(null)}
        />
      )}

      {offreCandidatures && (
        <CandidaturesModal offre={offreCandidatures} onClose={() => setOffreCandidatures(null)} />
      )}
    </div>
  );
}

export default MesOffres;
