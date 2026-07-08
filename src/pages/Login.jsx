import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { extraireErreur } from '../api/axiosClient';
import authService from '../api/authService';

const schema = yup.object({
  email: yup.string().email('Email invalide').required("L'email est obligatoire"),
  motDePasse: yup.string().required('Le mot de passe est obligatoire'),
});

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [chargement, setChargement] = useState(false);
  const [compteNonActive, setCompteNonActive] = useState(null); // email en attente d'activation
  const [renvoiEnCours, setRenvoiEnCours] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async (values) => {
    setChargement(true);
    setCompteNonActive(null);
    try {
      const utilisateur = await login(values.email, values.motDePasse);
      toast.success(`Bienvenue, ${utilisateur.prenom} !`);

      const destination = location.state?.from
        || (utilisateur.role === 'ADMIN' ? '/admin/utilisateurs' : '/offres');
      navigate(destination, { replace: true });
    } catch (error) {
      const { message, code } = extraireErreur(error);
      if (code === 'ACCOUNT_NOT_ACTIVATED') {
        setCompteNonActive(values.email);
      } else {
        toast.error(message);
      }
    } finally {
      setChargement(false);
    }
  };

  const renvoyerActivation = async () => {
    setRenvoiEnCours(true);
    try {
      await authService.resendActivation(compteNonActive);
      toast.success('Un nouveau lien d\'activation vous a été envoyé !');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setRenvoiEnCours(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-side">
        <h1>Trouvez le talent ou l'opportunité qu'il vous faut.</h1>
        <p>
          JobPlatform.GN connecte les candidats et les recruteurs guinéens sur une
          plateforme simple, rapide et sécurisée.
        </p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="auth-logo-icon">💼</div>
            <span className="auth-logo-name">JobPlatform.GN</span>
          </div>

          <h2 className="auth-title">Connexion</h2>
          <p className="auth-subtitle">Accédez à votre espace personnel.</p>

          {compteNonActive && (
            <div className="alert alert-warning">
              Votre compte n'est pas encore activé. Vérifiez votre boîte e-mail
              (et vos spams), ou{' '}
              <button
                type="button"
                onClick={renvoyerActivation}
                disabled={renvoiEnCours}
                style={{
                  background: 'none', border: 'none', padding: 0,
                  color: 'var(--primary)', fontWeight: 700, cursor: 'pointer',
                  textDecoration: 'underline',
                }}
              >
                {renvoiEnCours ? 'Envoi en cours…' : 'renvoyer le lien'}
              </button>.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="form-group">
              <label className="form-label">Adresse e-mail</label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'is-invalid' : ''}`}
                placeholder="vous@exemple.com"
                {...register('email')}
              />
              {errors.email && <span className="form-error-text">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Mot de passe</label>
              <input
                type="password"
                className={`form-input ${errors.motDePasse ? 'is-invalid' : ''}`}
                placeholder="••••••••"
                {...register('motDePasse')}
              />
              {errors.motDePasse && (
                <span className="form-error-text">{errors.motDePasse.message}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={chargement}>
              {chargement ? 'Connexion…' : <><FiLogIn /> Se connecter</>}
            </button>
          </form>

          <div className="divider">
            <span className="divider-line" />
            <span className="divider-text">ou</span>
            <span className="divider-line" />
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Pas encore de compte ?{' '}
            <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
