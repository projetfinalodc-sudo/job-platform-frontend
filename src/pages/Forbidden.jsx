import { Link } from 'react-router-dom';
import { FiLock, FiHome } from 'react-icons/fi';

function Forbidden() {
  return (
    <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <div
        style={{
          width: 88, height: 88, borderRadius: '50%', background: '#fde8e8',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem', fontSize: '2.2rem', color: 'var(--red)',
        }}
      >
        <FiLock />
      </div>
      <h2 style={{ color: 'var(--slate-800)', marginBottom: '0.5rem' }}>Accès refusé</h2>
      <p style={{ color: 'var(--slate-400)', marginBottom: '2rem' }}>
        Vous n'avez pas les droits nécessaires pour accéder à cette page.
      </p>
      <Link to="/offres" className="btn btn-primary">
        <FiHome /> Retour à l'accueil
      </Link>
    </div>
  );
}

export default Forbidden;
