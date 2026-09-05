import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheckCircle, FiXCircle, FiClock, FiMail } from 'react-icons/fi';
import authService from '../api/authService';
import { extraireErreur } from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';

function ActivationCompte() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [statut, setStatut] = useState('chargement'); // chargement | succes | expire | invalide | erreur
  const [email, setEmail] = useState('');
  const [renvoiEnCours, setRenvoiEnCours] = useState(false);
  const [renvoiFait, setRenvoiFait] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatut('invalide');
      return;
    }
    authService
      .activate(token)
      .then(() => setStatut('succes'))
      .catch((error) => {
        const { code } = extraireErreur(error);
        if (code === 'TOKEN_EXPIRED') setStatut('expire');
        else if (code === 'TOKEN_INVALID') setStatut('invalide');
        else setStatut('erreur');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const renvoyerLien = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Merci de renseigner votre e-mail.');
      return;
    }
    setRenvoiEnCours(true);
    try {
      await authService.resendActivation(email);
      setRenvoiFait(true);
      toast.success('Un nouveau lien vous a été envoyé !');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setRenvoiEnCours(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand-side">
        <h1>Activation de compte</h1>
        <p>Encore un instant avant de rejoindre JobPlatform.GN.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card" style={{ textAlign: 'center' }}>
          {statut === 'chargement' && <LoadingSpinner label="Activation en cours…" />}

          {statut === 'succes' && (
            <>
              <IconCercle couleurFond="#d4edda" couleurTexte="var(--green)" icon={<FiCheckCircle />} />
              <h2 className="auth-title">Compte activé avec succès !</h2>
              <p className="auth-subtitle">Vous pouvez maintenant vous connecter.</p>
              <Link to="/login" className="btn btn-primary btn-block">Se connecter</Link>
            </>
          )}

          {statut === 'expire' && (
            <>
              <IconCercle couleurFond="#fff3cd" couleurTexte="var(--amber)" icon={<FiClock />} />
              <h2 className="auth-title">Ce lien a expiré</h2>
              <p className="auth-subtitle">
                Les liens d'activation sont valables 24h. Entrez votre e-mail pour en recevoir un nouveau.
              </p>
              {renvoiFait ? (
                <div className="alert alert-success">Nouveau lien envoyé ! Vérifiez votre boîte mail.</div>
              ) : (
                <form onSubmit={renvoyerLien}>
                  <div className="form-group">
                    <input
                      type="email"
                      className="form-input"
                      placeholder="vous@exemple.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <button className="btn btn-primary btn-block" disabled={renvoiEnCours}>
                    {renvoiEnCours ? 'Envoi…' : <><FiMail /> Renvoyer le lien</>}
                  </button>
                </form>
              )}
            </>
          )}

          {statut === 'invalide' && (
            <>
              <IconCercle couleurFond="#fde8e8" couleurTexte="var(--red)" icon={<FiXCircle />} />
              <h2 className="auth-title">Lien invalide</h2>
              <p className="auth-subtitle">
                Ce lien d'activation est incorrect ou a déjà été utilisé.
              </p>
              <Link to="/login" className="btn btn-outline btn-block">Retour à la connexion</Link>
            </>
          )}

          {statut === 'erreur' && (
            <>
              <IconCercle couleurFond="#fde8e8" couleurTexte="var(--red)" icon={<FiXCircle />} />
              <h2 className="auth-title">Une erreur est survenue</h2>
              <p className="auth-subtitle">Merci de réessayer dans quelques instants.</p>
              <Link to="/login" className="btn btn-outline btn-block">Retour à la connexion</Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function IconCercle({ couleurFond, couleurTexte, icon }) {
  return (
    <div
      style={{
        width: 72, height: 72, borderRadius: '50%', background: couleurFond,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1.5rem', fontSize: '2rem', color: couleurTexte,
      }}
    >
      {icon}
    </div>
  );
}

export default ActivationCompte;
