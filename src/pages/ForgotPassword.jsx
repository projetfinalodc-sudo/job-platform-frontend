import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import authService from '../api/authService';
import { extraireErreur } from '../api/axiosClient';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [envoye, setEnvoye] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Merci de renseigner votre e-mail.');
      return;
    }
    setEnvoiEnCours(true);
    try {
      await authService.forgotPassword(email);
      setEnvoye(true);
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-side">
        <h1>Mot de passe oublié ?</h1>
        <p>Pas de panique, on va vous aider à en choisir un nouveau.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          {envoye ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%', background: '#d4edda',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', fontSize: '2rem', color: 'var(--green)',
              }}>
                <FiCheckCircle />
              </div>
              <h2 className="auth-title">E-mail envoyé !</h2>
              <p className="auth-subtitle">
                Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien
                de réinitialisation dans quelques instants. Pensez à vérifier vos spams.
              </p>
              <Link to="/login" className="btn btn-outline btn-block">Retour à la connexion</Link>
            </div>
          ) : (
            <>
              <div className="auth-logo">
                <img src="/logo192.png" alt="JobPlatform.GN" className="auth-logo-icon" />
                <span className="auth-logo-name">JobPlatform.GN</span>
              </div>
              <h2 className="auth-title">Réinitialiser mon mot de passe</h2>
              <p className="auth-subtitle">
                Entrez l'adresse e-mail associée à votre compte, on vous enverra un lien sécurisé.
              </p>
              <form onSubmit={onSubmit} noValidate>
                <div className="form-group">
                  <label className="form-label">Adresse e-mail</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="vous@exemple.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-block" disabled={envoiEnCours}>
                  {envoiEnCours ? 'Envoi…' : <><FiMail /> Envoyer le lien</>}
                </button>
              </form>
              <Link to="/login" className="btn btn-ghost btn-block" style={{ marginTop: '0.75rem' }}>
                <FiArrowLeft /> Retour à la connexion
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
