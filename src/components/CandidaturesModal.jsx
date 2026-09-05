import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiX, FiDownload, FiFileText, FiPhone, FiCalendar, FiCheck, FiXCircle, FiEdit3, FiEye,
  FiClock, FiSend, FiTrash2, FiChevronDown, FiChevronUp,
} from 'react-icons/fi';
import candidatureService from '../api/candidatureService';
import entretienService from '../api/entretienService';
import { extraireErreur } from '../api/axiosClient';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';

const STATUT_INFO = {
  EN_ATTENTE: { label: 'En attente', badge: 'badge-amber' },
  VUE: { label: 'Vue', badge: 'badge-blue' },
  ACCEPTEE: { label: 'Acceptée', badge: 'badge-green' },
  REFUSEE: { label: 'Refusée', badge: 'badge-red' },
};

const STATUT_ENTRETIEN_INFO = {
  PROPOSE: { label: 'En attente de réponse du candidat', badge: 'badge-amber' },
  CONFIRME: { label: 'Confirmé par le candidat', badge: 'badge-green' },
  REFUSE: { label: 'Décliné par le candidat', badge: 'badge-red' },
  ANNULE: { label: 'Annulé', badge: 'badge-gray' },
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

                  {c.statut === 'ACCEPTEE' && <SectionEntretien candidatureId={c.id} />}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SectionEntretien({ candidatureId }) {
  const [ouvert, setOuvert] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [entretien, setEntretien] = useState(undefined); // undefined = pas encore chargé, null = aucun
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);
  const [form, setForm] = useState({ date: '', heure: '', modalite: 'VISIO', lieuOuLien: '', message: '' });
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const toggler = () => {
    const nouvelEtat = !ouvert;
    setOuvert(nouvelEtat);
    if (nouvelEtat && entretien === undefined) {
      setChargement(true);
      entretienService.consulter(candidatureId)
        .then(setEntretien)
        .catch((error) => toast.error(extraireErreur(error).message))
        .finally(() => setChargement(false));
    }
  };

  const proposer = async (e) => {
    e.preventDefault();
    if (!form.date || !form.heure) {
      toast.error('La date et l\'heure sont obligatoires.');
      return;
    }
    setEnvoiEnCours(true);
    try {
      const dateHeure = `${form.date}T${form.heure}:00`;
      const maj = await entretienService.proposer(candidatureId, {
        dateHeure,
        modalite: form.modalite,
        lieuOuLien: form.lieuOuLien,
        message: form.message,
      });
      setEntretien(maj);
      setFormulaireOuvert(false);
      toast.success('Entretien proposé — le candidat a été notifié par e-mail.');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  const annuler = async () => {
    try {
      await entretienService.annuler(candidatureId);
      setEntretien((e) => ({ ...e, statut: 'ANNULE' }));
      toast.success('Entretien annulé.');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    }
  };

  return (
    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px dashed #e0e0e0' }}>
      <button className="btn btn-ghost btn-sm" onClick={toggler} type="button">
        <FiCalendar /> Entretien {ouvert ? <FiChevronUp /> : <FiChevronDown />}
      </button>

      {ouvert && (
        <div style={{ marginTop: '0.6rem' }}>
          {chargement ? (
            <LoadingSpinner label="Chargement…" />
          ) : entretien && entretien.statut !== 'ANNULE' ? (
            <div style={{ background: 'var(--slate-100)', borderRadius: 8, padding: '0.85rem' }}>
              <span className={`badge ${STATUT_ENTRETIEN_INFO[entretien.statut]?.badge || 'badge-gray'}`}>
                {STATUT_ENTRETIEN_INFO[entretien.statut]?.label}
              </span>
              <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                <div><FiClock /> {new Date(entretien.dateHeure).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}</div>
                <div style={{ marginTop: 4 }}>{LIBELLE_MODALITE[entretien.modalite]} — {entretien.lieuOuLien || 'non précisé'}</div>
                {entretien.message && <div style={{ marginTop: 4, fontStyle: 'italic' }}>« {entretien.message} »</div>}
              </div>
              <button className="btn btn-danger btn-sm" style={{ marginTop: '0.6rem' }} onClick={annuler}>
                <FiTrash2 /> Annuler l'entretien
              </button>
            </div>
          ) : formulaireOuvert ? (
            <form onSubmit={proposer} style={{ background: 'var(--slate-100)', borderRadius: 8, padding: '0.85rem' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Heure</label>
                  <input type="time" className="form-input" value={form.heure}
                    onChange={(e) => setForm((f) => ({ ...f, heure: e.target.value }))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Modalité</label>
                <select className="form-select" value={form.modalite}
                  onChange={(e) => setForm((f) => ({ ...f, modalite: e.target.value }))}>
                  <option value="VISIO">Visioconférence</option>
                  <option value="PRESENTIEL">Présentiel</option>
                  <option value="TELEPHONE">Téléphone</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">
                  {form.modalite === 'PRESENTIEL' ? 'Adresse' : form.modalite === 'VISIO' ? 'Lien de visioconférence' : 'Numéro à composer'}
                </label>
                <input className="form-input" value={form.lieuOuLien}
                  onChange={(e) => setForm((f) => ({ ...f, lieuOuLien: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Message (optionnel)</label>
                <textarea className="form-textarea" style={{ minHeight: 70 }} value={form.message}
                  onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFormulaireOuvert(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary btn-sm" disabled={envoiEnCours}>
                  <FiSend /> {envoiEnCours ? 'Envoi…' : 'Envoyer la proposition'}
                </button>
              </div>
            </form>
          ) : (
            <button className="btn btn-outline btn-sm" onClick={() => setFormulaireOuvert(true)}>
              <FiCalendar /> Planifier un entretien
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const LIBELLE_MODALITE = {
  VISIO: 'Visioconférence',
  PRESENTIEL: 'Présentiel',
  TELEPHONE: 'Téléphone',
};

function formaterDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default CandidaturesModal;
