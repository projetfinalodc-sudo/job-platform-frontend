import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiCalendar, FiClock, FiChevronDown, FiChevronUp, FiCheck, FiX, FiMapPin, FiVideo, FiPhoneCall,
} from 'react-icons/fi';
import candidatureService from '../api/candidatureService';
import entretienService from '../api/entretienService';
import { extraireErreur } from '../api/axiosClient';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUTS = {
  EN_ATTENTE: { label: 'En attente', badge: 'badge-amber' },
  VUE: { label: 'Vue par le recruteur', badge: 'badge-blue' },
  ACCEPTEE: { label: 'Acceptée', badge: 'badge-green' },
  REFUSEE: { label: 'Refusée', badge: 'badge-red' },
};

const STATUT_ENTRETIEN_INFO = {
  PROPOSE: { label: 'Entretien proposé — réponse attendue', badge: 'badge-amber' },
  CONFIRME: { label: 'Entretien confirmé', badge: 'badge-green' },
  REFUSE: { label: 'Entretien décliné', badge: 'badge-red' },
  ANNULE: { label: 'Entretien annulé par le recruteur', badge: 'badge-gray' },
};

const ICONE_MODALITE = { VISIO: FiVideo, PRESENTIEL: FiMapPin, TELEPHONE: FiPhoneCall };
const LIBELLE_MODALITE = { VISIO: 'Visioconférence', PRESENTIEL: 'Présentiel', TELEPHONE: 'Téléphone' };

function MesCandidatures() {
  const [candidatures, setCandidatures] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [ligneOuverte, setLigneOuverte] = useState(null);

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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {candidatures.map((c) => (
                <RangeeCandidature
                  key={c.id}
                  candidature={c}
                  ouverte={ligneOuverte === c.id}
                  onToggle={() => setLigneOuverte((id) => (id === c.id ? null : c.id))}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function RangeeCandidature({ candidature: c, ouverte, onToggle }) {
  const [chargement, setChargement] = useState(false);
  const [entretien, setEntretien] = useState(undefined); // undefined = pas encore chargé, null = aucun
  const [reponseEnCours, setReponseEnCours] = useState(false);

  const peutAvoirEntretien = c.statut === 'ACCEPTEE';

  const toggler = () => {
    onToggle();
    if (!ouverte && peutAvoirEntretien && entretien === undefined) {
      setChargement(true);
      entretienService.consulter(c.id)
        .then(setEntretien)
        .catch((error) => toast.error(extraireErreur(error).message))
        .finally(() => setChargement(false));
    }
  };

  const repondre = async (accepte) => {
    setReponseEnCours(true);
    try {
      const maj = await entretienService.repondre(c.id, accepte);
      setEntretien(maj);
      toast.success(accepte ? 'Entretien confirmé !' : 'Entretien décliné.');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setReponseEnCours(false);
    }
  };

  const IconeModalite = entretien ? ICONE_MODALITE[entretien.modalite] : null;

  return (
    <>
      <tr>
        <td>
          <Link to={`/offres/${c.offreId}`} style={{ color: 'var(--slate-800)', fontWeight: 600, textDecoration: 'none' }}>
            {c.titreOffre}
          </Link>
        </td>
        <td>{c.entreprise}</td>
        <td><FiCalendar /> {formaterDate(c.dateCandidature)}</td>
        <td><FiClock /> {formaterDate(c.dateDisponibilite)}</td>
        <td>
          <span className={`badge ${STATUTS[c.statut]?.badge || 'badge-gray'}`}>
            {STATUTS[c.statut]?.label || c.statut}
          </span>
        </td>
        <td>
          {peutAvoirEntretien && (
            <button className="btn btn-ghost btn-sm" onClick={toggler} type="button">
              Entretien {ouverte ? <FiChevronUp /> : <FiChevronDown />}
            </button>
          )}
        </td>
      </tr>

      {ouverte && peutAvoirEntretien && (
        <tr>
          <td colSpan={6} style={{ background: 'var(--slate-100)' }}>
            {chargement ? (
              <LoadingSpinner label="Chargement…" />
            ) : !entretien ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-400)', padding: '0.5rem 0' }}>
                Aucun entretien programmé pour l'instant. Le recruteur vous contactera bientôt.
              </p>
            ) : (
              <div style={{ padding: '0.75rem 0' }}>
                <span className={`badge ${STATUT_ENTRETIEN_INFO[entretien.statut]?.badge || 'badge-gray'}`}>
                  {STATUT_ENTRETIEN_INFO[entretien.statut]?.label}
                </span>

                <div style={{ marginTop: '0.6rem', fontSize: '0.88rem', color: 'var(--slate-700)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div><FiClock /> {new Date(entretien.dateHeure).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}</div>
                  <div>{IconeModalite && <IconeModalite />} {LIBELLE_MODALITE[entretien.modalite]} — {entretien.lieuOuLien || 'détails à venir'}</div>
                  {entretien.message && (
                    <div style={{ fontStyle: 'italic', color: 'var(--slate-500)' }}>« {entretien.message} »</div>
                  )}
                </div>

                {entretien.statut === 'PROPOSE' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
                    <button className="btn btn-success btn-sm" disabled={reponseEnCours} onClick={() => repondre(true)}>
                      <FiCheck /> Confirmer ma présence
                    </button>
                    <button className="btn btn-danger btn-sm" disabled={reponseEnCours} onClick={() => repondre(false)}>
                      <FiX /> Décliner
                    </button>
                  </div>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function formaterDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default MesCandidatures;
