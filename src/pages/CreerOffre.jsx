import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import offreService from '../api/offreService';
import { extraireErreur } from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';

const schema = yup.object({
  titre: yup.string().required('Le titre est obligatoire'),
  description: yup.string().required('La description est obligatoire'),
  localisation: yup.string().required('La localisation est obligatoire'),
  typeContrat: yup.string().nullable(),
  niveauEtude: yup.string().nullable(),
  salaire: yup.string().nullable(),
  dateExpiration: yup.string().nullable(),
});

function CreerOffre() {
  const { id } = useParams();
  const modeEdition = Boolean(id);
  const navigate = useNavigate();
  const [chargement, setChargement] = useState(modeEdition);
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    if (!modeEdition) return;
    offreService.getById(id)
      .then((offre) => {
        reset({
          titre: offre.titre,
          description: offre.description,
          localisation: offre.localisation,
          typeContrat: offre.typeContrat || '',
          niveauEtude: offre.niveauEtude || '',
          salaire: offre.salaire || '',
          dateExpiration: offre.dateExpiration ? offre.dateExpiration.split('T')[0] : '',
        });
      })
      .catch((error) => toast.error(extraireErreur(error).message))
      .finally(() => setChargement(false));
  }, [id, modeEdition, reset]);

  const onSubmit = async (values) => {
    setEnvoiEnCours(true);
    try {
      const payload = {
        ...values,
        dateExpiration: values.dateExpiration ? `${values.dateExpiration}T23:59:59` : null,
      };
      if (modeEdition) {
        await offreService.modifier(id, payload);
        toast.success('Offre modifiée !');
      } else {
        await offreService.creer(payload);
        toast.success('Offre publiée !');
      }
      navigate('/mes-offres');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (chargement) return <LoadingSpinner label="Chargement de l'offre…" />;

  return (
    <div className="page-wrapper" style={{ maxWidth: 700 }}>
      <Link to="/mes-offres" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
        <FiArrowLeft /> Retour à mes offres
      </Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">{modeEdition ? "Modifier l'offre" : 'Publier une offre'}</h1>
          <p className="page-subtitle">
            {modeEdition ? 'Mettez à jour les informations de votre offre' : 'Décrivez le poste que vous proposez'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card" noValidate>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label">Titre du poste</label>
            <input
              className={`form-input ${errors.titre ? 'is-invalid' : ''}`}
              placeholder="Ex: Développeur Full Stack React/Spring Boot"
              {...register('titre')}
            />
            {errors.titre && <span className="form-error-text">{errors.titre.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className={`form-textarea ${errors.description ? 'is-invalid' : ''}`}
              style={{ minHeight: 160 }}
              placeholder="Missions, responsabilités, profil recherché…"
              {...register('description')}
            />
            {errors.description && <span className="form-error-text">{errors.description.message}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Localisation</label>
              <input
                className={`form-input ${errors.localisation ? 'is-invalid' : ''}`}
                placeholder="Conakry, Guinée"
                {...register('localisation')}
              />
              {errors.localisation && <span className="form-error-text">{errors.localisation.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Type de contrat</label>
              <select className="form-select" {...register('typeContrat')}>
                <option value="">Sélectionner…</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Niveau d'étude</label>
              <input className="form-input" placeholder="Bac+3, Bac+5…" {...register('niveauEtude')} />
            </div>
            <div className="form-group">
              <label className="form-label">Salaire (optionnel)</label>
              <input className="form-input" placeholder="Ex: 3 000 000 - 5 000 000 GNF" {...register('salaire')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Date d'expiration des candidatures (optionnel)</label>
            <input type="date" className="form-input" style={{ maxWidth: 220 }} {...register('dateExpiration')} />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" disabled={envoiEnCours}>
            {envoiEnCours ? 'Enregistrement…' : <><FiSave /> {modeEdition ? 'Enregistrer les modifications' : "Publier l'offre"}</>}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreerOffre;
