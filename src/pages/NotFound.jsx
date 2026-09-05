import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';

function NotFound() {
  return (
    <div className="page-wrapper" style={{ textAlign: 'center', paddingTop: '5rem' }}>
      <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--primary-light)', lineHeight: 1 }}>
        404
      </div>
      <h2 style={{ color: 'var(--slate-800)', marginTop: '1rem', marginBottom: '0.5rem' }}>
        Page introuvable
      </h2>
      <p style={{ color: 'var(--slate-400)', marginBottom: '2rem' }}>
        La page que vous cherchez n'existe pas ou a été déplacée.
      </p>
      <Link to="/offres" className="btn btn-primary">
        <FiHome /> Retour à l'accueil
      </Link>
    </div>
  );
}

export default NotFound;
