import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiUser, FiBriefcase, FiCheck, FiArrowRight, FiArrowLeft, FiMail
} from 'react-icons/fi';
import { extraireErreur } from '../api/axiosClient';
import authService from '../api/authService';

const schema = yup.object({
  role: yup.string().oneOf(['CANDIDAT', 'RECRUTEUR'], 'Choisissez un profil').required('Choisissez un profil'),
  nom: yup.string().required('Le nom est obligatoire'),
  prenom: yup.string().required('Le prénom est obligatoire'),
  email: yup.string().email('Email invalide').required("L'email est obligatoire"),
  motDePasse: yup.string().min(6, 'Au moins 6 caractères').required('Le mot de passe est obligatoire'),
  confirmMotDePasse: yup
    .string()
    .oneOf([yup.ref('motDePasse')], 'Les mots de passe ne correspondent pas')
    .required('Confirmez le mot de passe'),
  telephone: yup.string().when('role', {
    is: 'CANDIDAT',
    then: (s) => s.required('Le téléphone est obligatoire'),
  }),
  competences: yup.string(),
  biographie: yup.string(),
  entreprise: yup.string().when('role', {
    is: 'RECRUTEUR',
    then: (s) => s.required("Le nom de l'entreprise est obligatoire"),
  }),
  secteur: yup.string(),
  siteWeb: yup.string().url('URL invalide (ex: https://exemple.com)').nullable().notRequired(),
});

const CHAMPS_PAR_ETAPE = [
  ['role'],
  ['nom', 'prenom', 'email', 'motDePasse', 'confirmMotDePasse'],
  null, // dépend du rôle, calculé dynamiquement
];

function Register() {
  const [etape, setEtape] = useState(0);
  const [chargement, setChargement] = useState(false);
  const [inscriptionReussie, setInscriptionReussie] = useState(null); // { email }
  const [renvoiEnCours, setRenvoiEnCours] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema), mode: 'onTouched' });

  const role = watch('role');
  const champsEtape2 = role === 'RECRUTEUR' ? ['entreprise', 'secteur', 'siteWeb'] : ['telephone', 'competences', 'biographie'];

  const suivant = async () => {
    const champs = etape === 2 ? champsEtape2 : CHAMPS_PAR_ETAPE[etape];
    const valide = await trigger(champs);
    if (valide) setEtape((e) => e + 1);
  };

  const precedent = () => setEtape((e) => e - 1);

  const onSubmit = async (values) => {
    setChargement(true);
    try {
      const payload = {
        nom: values.nom,
        prenom: values.prenom,
        email: values.email,
        motDePasse: values.motDePasse,
        role: values.role,
        telephone: values.telephone,
        competences: values.competences,
        biographie: values.biographie,
        entreprise: values.entreprise,
        secteur: values.secteur,
        siteWeb: values.siteWeb || null,
      };
      const reponse = await authService.register(payload);
      setInscriptionReussie({ email: reponse.email });
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setChargement(false);
    }
  };

  const renvoyerActivation = async () => {
    setRenvoiEnCours(true);
    try {
      await authService.resendActivation(inscriptionReussie.email);
      toast.success('Un nouveau lien a été envoyé !');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setRenvoiEnCours(false);
    }
  };

  // ── Écran de confirmation après inscription réussie ──
  if (inscriptionReussie) {
    return (
      <div className="auth-page">
        <div className="auth-brand-side">
          <h1>Bienvenue sur JobPlatform.GN</h1>
          <p>Plus qu'une étape avant de commencer à explorer les opportunités.</p>
        </div>
        <div className="auth-form-side">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 72, height: 72, borderRadius: '50%', background: '#d4edda',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', fontSize: '2rem', color: 'var(--green)',
              }}
            >
              <FiMail />
            </div>
            <h2 className="auth-title">Vérifiez votre boîte e-mail</h2>
            <p className="auth-subtitle">
              Un lien d'activation a été envoyé à <strong>{inscriptionReussie.email}</strong>.
              Cliquez dessus pour activer votre compte et pouvoir vous connecter.
            </p>
            <button
              className="btn btn-outline btn-block"
              onClick={renvoyerActivation}
              disabled={renvoiEnCours}
            >
              {renvoiEnCours ? 'Envoi en cours…' : "Je n'ai rien reçu, renvoyer le lien"}
            </button>
            <p style={{ marginTop: '1.5rem', fontSize: '0.85rem' }}>
              <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-brand-side">
        <h1>Rejoignez la référence de l'emploi en Guinée.</h1>
        <p>Que vous cherchiez un talent ou une opportunité, tout commence ici.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <div className="auth-logo">
            <div className="auth-logo-icon">💼</div>
            <span className="auth-logo-name">JobPlatform.GN</span>
          </div>

          <div className="stepper">
            <Etape numero={1} label="Profil" active={etape === 0} done={etape > 0} />
            <div className={`stepper-line ${etape > 0 ? 'done' : ''}`} />
            <Etape numero={2} label="Compte" active={etape === 1} done={etape > 1} />
            <div className={`stepper-line ${etape > 1 ? 'done' : ''}`} />
            <Etape numero={3} label="Détails" active={etape === 2} done={false} />
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* ÉTAPE 1 — Choix du profil */}
            {etape === 0 && (
              <div className="form-group">
                <label className="form-label">Je suis…</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <RoleCard
                    icon={<FiUser />}
                    label="Candidat"
                    description="Je cherche un emploi"
                    value="CANDIDAT"
                    register={register}
                    selected={role === 'CANDIDAT'}
                  />
                  <RoleCard
                    icon={<FiBriefcase />}
                    label="Recruteur"
                    description="Je publie des offres"
                    value="RECRUTEUR"
                    register={register}
                    selected={role === 'RECRUTEUR'}
                  />
                </div>
                {errors.role && <span className="form-error-text">{errors.role.message}</span>}
              </div>
            )}

            {/* ÉTAPE 2 — Infos communes */}
            {etape === 1 && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Prénom</label>
                    <input className={`form-input ${errors.prenom ? 'is-invalid' : ''}`} {...register('prenom')} />
                    {errors.prenom && <span className="form-error-text">{errors.prenom.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nom</label>
                    <input className={`form-input ${errors.nom ? 'is-invalid' : ''}`} {...register('nom')} />
                    {errors.nom && <span className="form-error-text">{errors.nom.message}</span>}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Adresse e-mail</label>
                  <input type="email" className={`form-input ${errors.email ? 'is-invalid' : ''}`} {...register('email')} />
                  {errors.email && <span className="form-error-text">{errors.email.message}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Mot de passe</label>
                    <input type="password" className={`form-input ${errors.motDePasse ? 'is-invalid' : ''}`} {...register('motDePasse')} />
                    {errors.motDePasse && <span className="form-error-text">{errors.motDePasse.message}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirmer</label>
                    <input type="password" className={`form-input ${errors.confirmMotDePasse ? 'is-invalid' : ''}`} {...register('confirmMotDePasse')} />
                    {errors.confirmMotDePasse && <span className="form-error-text">{errors.confirmMotDePasse.message}</span>}
                  </div>
                </div>
              </>
            )}

            {/* ÉTAPE 3 — Infos spécifiques au rôle */}
            {etape === 2 && role === 'CANDIDAT' && (
              <>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className={`form-input ${errors.telephone ? 'is-invalid' : ''}`} placeholder="+224 6XX XX XX XX" {...register('telephone')} />
                  {errors.telephone && <span className="form-error-text">{errors.telephone.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Compétences</label>
                  <input className="form-input" placeholder="React, Java, Gestion de projet…" {...register('competences')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Courte biographie</label>
                  <textarea className="form-textarea" placeholder="Parlez un peu de vous…" {...register('biographie')} />
                </div>
              </>
            )}

            {etape === 2 && role === 'RECRUTEUR' && (
              <>
                <div className="form-group">
                  <label className="form-label">Nom de l'entreprise</label>
                  <input className={`form-input ${errors.entreprise ? 'is-invalid' : ''}`} {...register('entreprise')} />
                  {errors.entreprise && <span className="form-error-text">{errors.entreprise.message}</span>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Secteur d'activité</label>
                    <input className="form-input" placeholder="Technologie, BTP, Finance…" {...register('secteur')} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Téléphone</label>
                    <input className="form-input" placeholder="+224 6XX XX XX XX" {...register('telephone')} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Site web (optionnel)</label>
                  <input className={`form-input ${errors.siteWeb ? 'is-invalid' : ''}`} placeholder="https://..." {...register('siteWeb')} />
                  {errors.siteWeb && <span className="form-error-text">{errors.siteWeb.message}</span>}
                </div>
              </>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
              {etape > 0 && (
                <button type="button" className="btn btn-ghost" onClick={precedent}>
                  <FiArrowLeft /> Retour
                </button>
              )}
              {etape < 2 ? (
                <button type="button" className="btn btn-primary btn-block" onClick={suivant}>
                  Continuer <FiArrowRight />
                </button>
              ) : (
                <button type="submit" className="btn btn-primary btn-block" disabled={chargement}>
                  {chargement ? 'Création…' : <><FiCheck /> Créer mon compte</>}
                </button>
              )}
            </div>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '1.5rem' }}>
            Déjà inscrit ?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Etape({ numero, label, active, done }) {
  return (
    <div className={`stepper-step ${active ? 'active' : ''} ${done ? 'done' : ''}`}>
      <span className="stepper-circle">{done ? <FiCheck /> : numero}</span>
      <span>{label}</span>
    </div>
  );
}

function RoleCard({ icon, label, description, value, register, selected }) {
  return (
    <label
      className="card"
      style={{
        padding: '1.25rem',
        cursor: 'pointer',
        textAlign: 'center',
        borderColor: selected ? 'var(--primary)' : undefined,
        background: selected ? 'var(--primary-light)' : undefined,
      }}
    >
      <input type="radio" value={value} {...register('role')} style={{ display: 'none' }} />
      <div style={{ fontSize: '1.5rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{icon}</div>
      <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.9rem' }}>{label}</div>
      <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)' }}>{description}</div>
    </label>
  );
}

export default Register;
