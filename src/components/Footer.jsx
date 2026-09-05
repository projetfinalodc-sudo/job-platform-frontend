import { Link } from 'react-router-dom';
import { FiBriefcase, FiMail } from 'react-icons/fi';

function Footer() {
  const annee = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="site-footer-brand">
          <div className="site-footer-logo">
            <img src="/logo192.png" alt="JobPlatform.GN" />
            <span>JobPlatform.GN</span>
          </div>
          <p>La plateforme qui connecte candidats et recruteurs en Guinée.</p>
        </div>

        <div className="site-footer-col">
          <span className="site-footer-title">Navigation</span>
          <Link to="/offres"><FiBriefcase /> Offres</Link>
          <Link to="/login">Connexion</Link>
        </div>

        <div className="site-footer-col">
          <span className="site-footer-title">Contact</span>
          <a href="mailto:contact@jobplatform.gn"><FiMail /> contact@jobplatform.gn</a>
        </div>
      </div>

      <div className="site-footer-bottom">
        © {annee} JobPlatform.GN — Tous droits réservés.
      </div>
    </footer>
  );
}

export default Footer;
