import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiBriefcase,
  FiFileText,
  FiPlusCircle,
  FiUsers,
  FiUser,
  FiLogOut,
  FiChevronDown,
} from 'react-icons/fi';

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOuvert, setMenuOuvert] = useState(false);
  const menuRef = useRef(null);

  // Ferme le menu déroulant si on clique en dehors
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOuvert(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOuvert(false);
    navigate('/login');
  };

  const initiales = user ? `${user.prenom?.[0] || ''}${user.nom?.[0] || ''}`.toUpperCase() : '';

  return (
    <nav className="navbar">
      <NavLink to="/offres" className="navbar-brand">
        <div className="navbar-brand-icon">💼</div>
        <span className="navbar-brand-name">JobPlatform.GN</span>
      </NavLink>

      <ul className="navbar-links">
        <li>
          <NavLink to="/offres">
            <FiBriefcase /> Offres
          </NavLink>
        </li>

        {user?.role === 'CANDIDAT' && (
          <li>
            <NavLink to="/mes-candidatures">
              <FiFileText /> Mes candidatures
            </NavLink>
          </li>
        )}

        {user?.role === 'RECRUTEUR' && (
          <>
            <li>
              <NavLink to="/mes-offres">
                <FiFileText /> Mes offres
              </NavLink>
            </li>
            <li>
              <NavLink to="/creer-offre">
                <FiPlusCircle /> Publier une offre
              </NavLink>
            </li>
          </>
        )}

        {user?.role === 'ADMIN' && (
          <li>
            <NavLink to="/admin/utilisateurs">
              <FiUsers /> Utilisateurs
            </NavLink>
          </li>
        )}
      </ul>

      <div className="navbar-right">
        {isAuthenticated ? (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <div
              onClick={() => setMenuOuvert((v) => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}
            >
              <div className="navbar-user-info">
                <span className="navbar-user-name">{user.prenom} {user.nom}</span>
                <span className="navbar-user-role">{libelleRole(user.role)}</span>
              </div>
              <div className="navbar-avatar">{initiales}</div>
              <FiChevronDown color="var(--slate-400)" />
            </div>

            {menuOuvert && (
              <div
                className="card"
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '52px',
                  width: '200px',
                  zIndex: 200,
                  padding: '0.5rem',
                }}
              >
                <MenuItem
                  icon={<FiUser />}
                  label="Mon profil"
                  onClick={() => { setMenuOuvert(false); navigate('/profil'); }}
                />
                <MenuItem
                  icon={<FiLogOut />}
                  label="Déconnexion"
                  onClick={handleLogout}
                  danger
                />
              </div>
            )}
          </div>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-ghost btn-sm">Connexion</NavLink>
            <NavLink to="/register" className="btn btn-primary btn-sm">Inscription</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

function MenuItem({ icon, label, onClick, danger }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        padding: '0.65rem 0.75rem',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: 600,
        color: danger ? 'var(--red)' : 'var(--slate-600)',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--slate-100)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {icon} {label}
    </div>
  );
}

function libelleRole(role) {
  switch (role) {
    case 'CANDIDAT': return 'Candidat';
    case 'RECRUTEUR': return 'Recruteur';
    case 'ADMIN': return 'Administrateur';
    default: return '';
  }
}

export default Navbar;
