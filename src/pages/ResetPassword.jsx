import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLock, FiXCircle, FiClock } from 'react-icons/fi';
import authService from '../api/authService';
import { extraireErreur } from '../api/axiosClient';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [motDePasse, setMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [erreurToken, setErreurToken] = useState(null); // null | 'expire' | 'invalide'

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Lien invalide : token manquant.");
      return;
    }
    if (motDePasse.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (motDePasse !== confirmation) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }

    setEnvoiEnCours(true);
    try {
      await authService.resetPassword(token, motDePasse);
      toast.success('Mot de passe réinitialisé ! Vous pouvez vous connecter.');
      navigate('/login');
    } catch (error) {
      const { code, message } = extraireErreur(error);
      if (code === 'TOKEN_EXPIRED') setErreurToken('expire');
      else if (code === 'TOKEN_INVALID') setErreurToken('invalide');
      else toast.error(message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-side">
        <h1>Nouveau mot de passe</h1>
        <p>Choisissez un mot de passe solide pour sécuriser votre compte.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          {!token || erreurToken ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: '#fde8e8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', fontSize: '2rem', color: 'var(--red)',
              }}>
                {erreurToken === 'expire' ? <FiClock /> : <FiXCircle />}
              </div>
              <h2 className="auth-title">
                {erreurToken === 'expire' ? 'Ce lien a expiré' : 'Lien invalide'}
              </h2>
              <p className="auth-subtitle">
                {erreurToken === 'expire'
                  ? 'Les liens de réinitialisation sont valables 30 minutes.'
                  : "Ce lien est incorrect, a déjà été utilisé, ou aucun token n'a été fourni."}
              </p>
              <Link to="/forgot-password" className="btn btn-primary btn-block">
                Redemander un lien
              </Link>
            </div>
          ) : (
            <>
              <div className="auth-logo">
                <img src="/logo192.png" alt="JobPlatform.GN" className="auth-logo-icon" />
                <span className="auth-logo-name">JobPlatform.GN</span>
              </div>
              <h2 className="auth-title">Choisir un nouveau mot de passe</h2>
              <p className="auth-subtitle">Minimum 6 caractères.</p>
              <form onSubmit={onSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label">Nouveau mot de passe</label>
                  <input
                    type="password"
                    className="form-input"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    className="form-input"
                    value={confirmation}
                    onChange={(e) => setConfirmation(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={envoiEnCours}>
                  {envoiEnCours ? 'Enregistrement…' : <><FiLock /> Réinitialiser le mot de passe</>}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
