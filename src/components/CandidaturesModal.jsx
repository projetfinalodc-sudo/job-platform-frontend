import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiX, FiDownload, FiFileText, FiPhone, FiCalendar, FiCheck, FiXCircle, FiEdit3, FiEye,
} from 'react-icons/fi';
import candidatureService from '../api/candidatureService';
import { extraireErreur } from '../api/axiosClient';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const STATUT_INFO = {
  EN_ATTENTE: { label: 'En attente', badge: 'badge-amber' },
  VUE: { label: 'Vue', badge: 'badge-blue' },
  ACCEPTEE: { label: 'Acceptée', badge: 'badge-green' },
  REFUSEE: { label: 'Refusée', badge: 'badge-red' },
};

function CandidaturesModal({ offre, onClose }) {
  const [candidatures, setCandidatures] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [enRevision, setEnRevision] = useState({}); // { [candidatureId]: true }

  useEffect(() => {
    chargerCandidatures();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chargerCandidatures = () => {
    setChargement(true);
    candidatureService.getCandidaturesOffre(offre.id)
      .then(setCandidatures)
      .catch((error) => toast.error(extraireErreur(error).message))
      .finally(() => setChargement(false));
  };

  const changerStatut = async (id, statut) => {
    try {
      const maj = await candidatureService.changerStatut(id, statut);
      setCandidatures((liste) => liste.map((c) => (c.id === id ? maj : c)));
      setEnRevision((etat) => ({ ...etat, [id]: false }));
      toast.success(
        statut === 'ACCEPTEE' ? 'Candidature acceptée — le candidat a été notifié par e-mail.'
        : statut === 'REFUSEE' ? 'Candidature refusée — le candidat a été notifié par e-mail.'
        : 'Statut mis à jour !'
      );
    } catch (error) {
      toast.error(extraireErreur(error).message);
    }
  };

  const telechargerCv = (candidatureId) => {
    candidatureService.telechargerCv(candidatureId, 'cv.pdf')
      .catch((error) => toast.error(extraireErreur(error).message));
  };

  const telechargerLettre = (candidatureId) => {
    candidatureService.telechargerLettre(candidatureId, 'lettre.pdf')
      .catch((error) => toast.error(extraireErreur(error).message));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <div>
            <span className="card-title">Candidatures reçues</span>
            <p className="card-subtitle">{offre.titre}</p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><FiX /></button>
        </div>
        <div className="card-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {chargement ? (
            <LoadingSpinner />
          ) : candidatures.length === 0 ? (
            <EmptyState icon="📭" title="Aucune candidature pour le moment" />
          ) : (
            candidatures.map((c) => (
              <div key={c.id} className="card" style={{ marginBottom: '1rem' }}>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 700, color: 'var(--slate-800)' }}>
                        {c.prenomCandidat} {c.nomCandidat}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>{c.emailCandidat}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${STATUT_INFO[c.statut]?.badge || 'badge-gray'}`}>
                        {STATUT_INFO[c.statut]?.label || c.statut}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '0.75rem' }}>
                    <span><FiPhone /> {c.telephoneContact}</span>
                    <span><FiCalendar /> Disponible le {formaterDate(c.dateDisponibilite)}</span>
                  </div>

                  {c.lettreMotivation && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', background: 'var(--slate-100)', padding: '0.75rem', borderRadius: 8, marginBottom: '0.75rem' }}>
                      {c.lettreMotivation}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => telechargerCv(c.id)}>
                      <FiDownload /> Télécharger le CV
                    </button>
                    {c.lettreMotivationPath && (
                      <button className="btn btn-ghost btn-sm" onClick={() => telechargerLettre(c.id)}>
                        <FiFileText /> Lettre jointe
                      </button>
                    )}
                  </div>

                  {/* Décision : boutons explicites Accepter / Refuser */}
                  {(c.statut === 'EN_ATTENTE' || c.statut === 'VUE' || enRevision[c.id]) ? (
                    <div style={{ display: 'flex', gap: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
                      {c.statut === 'EN_ATTENTE' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => changerStatut(c.id, 'VUE')}>
                          <FiEye /> Marquer comme vue
                        </button>
                      )}
                      <div style={{ flex: 1 }} />
                      <button className="btn btn-success btn-sm" onClick={() => changerStatut(c.id, 'ACCEPTEE')}>
                        <FiCheck /> Accepter
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => changerStatut(c.id, 'REFUSEE')}>
                        <FiXCircle /> Refuser
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.75rem', borderTop: '1px solid #f0f0f0' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEnRevision((etat) => ({ ...etat, [c.id]: true }))}
                      >
                        <FiEdit3 /> Revenir sur la décision
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function formaterDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default CandidaturesModal;
