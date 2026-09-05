import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSend, FiClock, FiCheckCircle, FiXCircle, FiBriefcase, FiArrowRight, FiCalendar, FiVideo, FiMapPin, FiPhoneCall } from 'react-icons/fi';
import dashboardService from '../api/dashboardService';
import entretienService from '../api/entretienService';
import { extraireErreur } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const ICONE_MODALITE = { VISIO: FiVideo, PRESENTIEL: FiMapPin, TELEPHONE: FiPhoneCall };
const LIBELLE_MODALITE = { VISIO: 'Visioconférence', PRESENTIEL: 'Présentiel', TELEPHONE: 'Téléphone' };

const STATUT_INFO = {
  EN_ATTENTE: { label: 'En attente', badge: 'badge-amber' },
  VUE: { label: 'Vue', badge: 'badge-blue' },
  ACCEPTEE: { label: 'Acceptée', badge: 'badge-green' },
  REFUSEE: { label: 'Refusée', badge: 'badge-red' },
};

function formaterDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function DashboardCandidat() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [entretiens, setEntretiens] = useState([]);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardService.getDashboardCandidat(),
      entretienService.mesEntretiens().catch(() => []),
    ])
      .then(([dashboardData, entretiensData]) => {
        setDashboard(dashboardData);
        setEntretiens((entretiensData || []).filter((e) => e.statut !== 'ANNULE' && e.statut !== 'REFUSE'));
      })
      .catch((error) => toast.error(extraireErreur(error).message))
      .finally(() => setChargement(false));
  }, []);

  if (chargement) return <LoadingSpinner label="Chargement de votre tableau de bord…" />;
  if (!dashboard) return null;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bonjour {user?.prenom} 👋</h1>
          <p className="page-subtitle">Voici un aperçu de votre activité sur JobPlatform.GN</p>
        </div>
        <Link to="/offres" className="btn btn-primary">
          <FiBriefcase /> Parcourir les offres
        </Link>
      </div>

      {entretiens.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
          <div className="card-header">
            <span className="card-title"><FiCalendar /> Vos prochains entretiens</span>
            <Link to="/mes-candidatures" className="btn btn-ghost btn-sm">Tout voir <FiArrowRight /></Link>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {entretiens.map((e) => {
              const Icone = ICONE_MODALITE[e.modalite];
              return (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <span className={`badge ${e.statut === 'CONFIRME' ? 'badge-green' : 'badge-amber'}`}>
                    {e.statut === 'CONFIRME' ? 'Confirmé' : 'À confirmer'}
                  </span>
                  <span style={{ fontWeight: 600, color: 'var(--slate-700)' }}>
                    {new Date(e.dateHeure).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                  </span>
                  <span style={{ color: 'var(--slate-500)' }}>
                    {Icone && <Icone />} {LIBELLE_MODALITE[e.modalite]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="stats-grid">
        <Link to="/mes-candidatures" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Candidatures envoyées</span>
            <div className="stat-icon blue"><FiSend /></div>
          </div>
          <div className="stat-value">{dashboard.candidaturesEnvoyees}</div>
        </Link>
        <Link to="/mes-candidatures" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">En attente</span>
            <div className="stat-icon amber"><FiClock /></div>
          </div>
          <div className="stat-value">{dashboard.candidaturesEnAttente}</div>
        </Link>
        <Link to="/mes-candidatures" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Acceptées</span>
            <div className="stat-icon green"><FiCheckCircle /></div>
          </div>
          <div className="stat-value">{dashboard.candidaturesAcceptees}</div>
        </Link>
        <Link to="/mes-candidatures" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Refusées</span>
            <div className="stat-icon red"><FiXCircle /></div>
          </div>
          <div className="stat-value">{dashboard.candidaturesRefusees}</div>
        </Link>
        <Link to="/offres" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Offres disponibles</span>
            <div className="stat-icon violet"><FiBriefcase /></div>
          </div>
          <div className="stat-value">{dashboard.offresDisponibles}</div>
        </Link>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">Dernières candidatures</span>
          <Link to="/mes-candidatures" className="btn btn-ghost btn-sm">
            Tout voir <FiArrowRight />
          </Link>
        </div>
        {(!dashboard.dernieresCandidatures || dashboard.dernieresCandidatures.length === 0) ? (
          <EmptyState icon="📨" title="Aucune candidature envoyée" description="Parcourez les offres pour postuler." />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Offre</th>
                  <th>Entreprise</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.dernieresCandidatures.map((c) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{c.titreOffre}</td>
                    <td>{c.entreprise}</td>
                    <td>{formaterDate(c.dateCandidature)}</td>
                    <td>
                      <span className={`badge ${STATUT_INFO[c.statut]?.badge || 'badge-gray'}`}>
                        {STATUT_INFO[c.statut]?.label || c.statut}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardCandidat;
