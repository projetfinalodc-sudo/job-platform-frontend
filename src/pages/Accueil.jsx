import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiBriefcase, FiUsers, FiSearch, FiUserPlus, FiSend,
  FiCheckCircle, FiFileText, FiEye, FiCalendar,
} from 'react-icons/fi';
import statsService from '../api/statsService';
import heroBg from '../assets/hero-bg.svg';

function Accueil() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    statsService.getStatsPubliques()
      .then(setStats)
      .catch(() => setStats(null)); // page reste utilisable même si les stats échouent
  }, []);

  return (
    <div>
      {/* ── Bandeau principal (image de fond) ── */}
      <section className="hero-section anim-fade-in" style={{ backgroundImage: `url(${heroBg})` }}>
        <div className="hero-content">
          <h1 className="anim-fade-up" style={{ animationDelay: '0.05s' }}>
            La plateforme qui connecte<br />candidats et recruteurs en Guinée
          </h1>
          <p className="anim-fade-up" style={{ animationDelay: '0.15s' }}>
            Trouvez votre prochain emploi ou le talent qu'il vous faut — publication d'offres,
            candidature en ligne, entretiens, tout au même endroit.
          </p>
          <div className="hero-actions anim-fade-up" style={{ animationDelay: '0.25s' }}>
            <Link to="/offres" className="btn btn-lg" style={{ background: '#fff', color: 'var(--primary)' }}>
              <FiSearch /> Voir les offres
            </Link>
            <Link to="/register" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
              <FiUserPlus /> Créer un compte
            </Link>
          </div>
        </div>
      </section>

      {/* ── Statistiques réelles (sous le bandeau, sans chevauchement) ── */}
      <section className="page-wrapper" style={{ paddingTop: '2.5rem' }}>
        <div className="hero-stats-grid">
          <div className="hero-stat-card anim-fade-up" style={{ animationDelay: '0.1s' }}>
            <FiBriefcase />
            <div className="hero-stat-value">{stats ? stats.offresActives : '—'}</div>
            <div className="hero-stat-label">Offres actives</div>
          </div>
          <div className="hero-stat-card anim-fade-up" style={{ animationDelay: '0.2s' }}>
            <FiUsers />
            <div className="hero-stat-value">{stats ? stats.candidatsInscrits : '—'}</div>
            <div className="hero-stat-label">Candidats inscrits</div>
          </div>
          <div className="hero-stat-card anim-fade-up" style={{ animationDelay: '0.3s' }}>
            <FiBriefcase />
            <div className="hero-stat-value">{stats ? stats.recruteursInscrits : '—'}</div>
            <div className="hero-stat-label">Entreprises recruteuses</div>
          </div>
        </div>
      </section>

      {/* ── Comment ça marche ── */}
      <section className="page-wrapper" style={{ paddingTop: '1rem' }}>
        <div className="page-header" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column' }}>
          <h2 className="page-title">Comment ça marche</h2>
          <p className="page-subtitle">Un parcours simple, que vous cherchiez un emploi ou un talent</p>
        </div>

        <div className="howitworks-grid">
          <div className="card anim-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="card-header">
              <span className="card-title">👤 Pour les candidats</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <EtapeItem icone={<FiSearch />} titre="Parcourez les offres" texte="Recherchez par titre, secteur ou localisation." />
              <EtapeItem icone={<FiSend />} titre="Postulez en ligne" texte="CV, lettre de motivation (même générée par IA), disponibilité." />
              <EtapeItem icone={<FiCalendar />} titre="Passez l'entretien" texte="Suivez vos candidatures et vos entretiens depuis votre tableau de bord." />
            </div>
          </div>

          <div className="card anim-fade-up" style={{ animationDelay: '0.2s' }}>
            <div className="card-header">
              <span className="card-title">🏢 Pour les recruteurs</span>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <EtapeItem icone={<FiFileText />} titre="Publiez une offre" texte="Tous les candidats actifs sont notifiés automatiquement." />
              <EtapeItem icone={<FiEye />} titre="Consultez les candidatures" texte="CV, lettres de motivation, profils, tout centralisé." />
              <EtapeItem icone={<FiCheckCircle />} titre="Recrutez" texte="Acceptez, refusez ou planifiez un entretien en un clic." />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function EtapeItem({ icone, titre, texte }) {
  return (
    <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'flex-start' }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, background: 'var(--primary-light)',
        color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, fontSize: '1.1rem',
      }}>
        {icone}
      </div>
      <div>
        <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.92rem' }}>{titre}</div>
        <div style={{ fontSize: '0.83rem', color: 'var(--slate-500)', marginTop: 2 }}>{texte}</div>
      </div>
    </div>
  );
}

export default Accueil;
