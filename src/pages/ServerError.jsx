import { Link } from 'react-router-dom';
import { FiAlertOctagon, FiHome, FiRefreshCw } from 'react-icons/fi';

function ServerError() {
  return (
    <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <div
        style={{
          width: 88, height: 88, borderRadius: '50%', background: '#fff3cd',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', fontSize: '2.2rem', color: 'var(--amber)',
        }}
      >
        <FiAlertOctagon />
      </div>
      <h2 style={{ color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
        Une erreur est survenue
      </h2>
      <p style={{ color: 'var(--slate-400)', marginBottom: '2rem' }}>
        Le serveur a rencontré un problème inattendu. Merci de réessayer dans quelques instants.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button className="btn btn-ghost" onClick={() => window.location.reload()}>
          <FiRefreshCw /> Réessayer
        </button>
        <Link to="/offres" className="btn btn-primary">
          <FiHome /> Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

export default ServerError;
