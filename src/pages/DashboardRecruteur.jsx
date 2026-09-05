import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiFileText, FiCheckSquare, FiUsers, FiUserCheck, FiPlusCircle, FiArrowRight } from 'react-icons/fi';
import dashboardService from '../api/dashboardService';
import { extraireErreur } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

const STATUT_INFO = {
  EN_ATTENTE: { label: 'En attente', badge: 'badge-amber' },
  VUE: { label: 'Vue', badge: 'badge-blue' },
  ACCEPTEE: { label: 'Acceptée', badge: 'badge-green' },
  REFUSEE: { label: 'Refusée', badge: 'badge-red' },
};
const STATUT_OFFRE = { ACTIVE: 'badge-green', FERMEE: 'badge-gray', EXPIREE: 'badge-red' };

function formaterDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function DashboardRecruteur() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    dashboardService.getDashboardRecruteur()
      .then(setDashboard)
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
          <p className="page-subtitle">Voici un aperçu de votre activité de recrutement</p>
        </div>
        <Link to="/creer-offre" className="btn btn-primary">
          <FiPlusCircle /> Publier une offre
        </Link>
      </div>

      <div className="stats-grid">
        <Link to="/mes-offres" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Offres publiées</span>
            <div className="stat-icon blue"><FiFileText /></div>
          </div>
          <div className="stat-value">{dashboard.offresPubliees}</div>
        </Link>
        <Link to="/mes-offres" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Offres actives</span>
            <div className="stat-icon green"><FiCheckSquare /></div>
          </div>
          <div className="stat-value">{dashboard.offresActives}</div>
        </Link>
        <Link to="/mes-offres" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Candidatures reçues</span>
            <div className="stat-icon violet"><FiUsers /></div>
          </div>
          <div className="stat-value">{dashboard.candidaturesRecues}</div>
        </Link>
        <Link to="/mes-offres" className="stat-card">
          <div className="stat-card-top">
            <span className="stat-label">Candidats uniques</span>
            <div className="stat-icon amber"><FiUserCheck /></div>
          </div>
          <div className="stat-value">{dashboard.candidatsUniques}</div>
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Dernières candidatures</span>
            <Link to="/mes-offres" className="btn btn-ghost btn-sm">Tout voir <FiArrowRight /></Link>
          </div>
          {(!dashboard.dernieresCandidatures || dashboard.dernieresCandidatures.length === 0) ? (
            <EmptyState icon="👥" title="Aucune candidature reçue" description="" />
          ) : (
            <div style={{ padding: '0.5rem 0' }}>
              {dashboard.dernieresCandidatures.map((c) => (
                <div key={c.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1.5rem', borderBottom: '1px solid #f5f5f5',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--slate-800)' }}>
                      {c.prenomCandidat} {c.nomCandidat}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>{c.titreOffre}</div>
                  </div>
                  <span className={`badge ${STATUT_INFO[c.statut]?.badge || 'badge-gray'}`}>
                    {STATUT_INFO[c.statut]?.label || c.statut}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Dernières offres</span>
            <Link to="/mes-offres" className="btn btn-ghost btn-sm">Tout voir <FiArrowRight /></Link>
          </div>
          {(!dashboard.dernieresOffres || dashboard.dernieresOffres.length === 0) ? (
            <EmptyState icon="📋" title="Aucune offre publiée" description="" />
          ) : (
            <div style={{ padding: '0.5rem 0' }}>
              {dashboard.dernieresOffres.map((o) => (
                <div key={o.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '0.75rem 1.5rem', borderBottom: '1px solid #f5f5f5',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--slate-800)' }}>{o.titre}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>{formaterDate(o.datePublication)}</div>
                  </div>
                  <span className={`badge ${STATUT_OFFRE[o.statut] || 'badge-gray'}`}>{o.statut}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardRecruteur;
