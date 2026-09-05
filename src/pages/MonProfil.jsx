import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { FiSave, FiUpload, FiFile, FiDownload, FiUser, FiLock } from 'react-icons/fi';
import utilisateurService from '../api/utilisateurService';
import authService from '../api/authService';
import { extraireErreur } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function MonProfil() {
  const { updateUser } = useAuth();
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [enregistrement, setEnregistrement] = useState(false);
  const [form, setForm] = useState({});
  const [uploadCvEnCours, setUploadCvEnCours] = useState(false);
  const [progressionCv, setProgressionCv] = useState(0);
  const cvInputRef = useRef(null);

  useEffect(() => {
    utilisateurService.getMonProfil()
      .then((data) => {
        setProfil(data);
        setForm({
          nom: data.nom,
          prenom: data.prenom,
          email: data.email,
          telephone: data.telephone || '',
          competences: data.competences || '',
          biographie: data.biographie || '',
          entreprise: data.entreprise || '',
          secteur: data.secteur || '',
          siteWeb: data.siteWeb || '',
        });
      })
      .catch((error) => toast.error(extraireErreur(error).message))
      .finally(() => setChargement(false));
  }, []);

  const majChamp = (champ, valeur) => setForm((f) => ({ ...f, [champ]: valeur }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnregistrement(true);
    try {
      const maj = await utilisateurService.modifierMonProfil(form);
      setProfil(maj);
      updateUser({ nom: maj.nom, prenom: maj.prenom, email: maj.email });
      toast.success('Profil mis à jour !');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setEnregistrement(false);
    }
  };

  const onUploadCv = async (file) => {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!['.pdf', '.doc', '.docx'].includes(extension)) {
      toast.error('Formats acceptés : PDF, DOC, DOCX uniquement.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Le fichier dépasse la taille maximale de 5 Mo.');
      return;
    }
    setUploadCvEnCours(true);
    setProgressionCv(0);
    try {
      const nouveauNom = await utilisateurService.uploadCV(file, setProgressionCv);
      setProfil((p) => ({ ...p, cvPath: nouveauNom }));
      toast.success('CV mis à jour !');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setUploadCvEnCours(false);
    }
  };

  if (chargement) return <LoadingSpinner label="Chargement du profil…" />;
  if (!profil) return null;

  return (
    <div className="page-wrapper" style={{ maxWidth: 720 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mon profil</h1>
          <p className="page-subtitle">Gérez vos informations personnelles</p>
        </div>
      </div>

      {profil.role === 'CANDIDAT' && (
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-header">
            <span className="card-title">Mon CV</span>
            <span className="card-subtitle">Utilisé pour pré-remplir vos candidatures</span>
          </div>
          <div className="card-body">
            {profil.cvPath ? (
              <div className="file-preview">
                <div className="file-preview-info">
                  <FiFile color="var(--green)" />
                  <span>CV actuel enregistré</span>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => utilisateurService.telechargerCV(profil.cvPath)}
                >
                  <FiDownload /> Télécharger
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
                Aucun CV enregistré pour le moment.
              </p>
            )}

            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files?.[0] && onUploadCv(e.target.files[0])}
            />
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ marginTop: '0.85rem' }}
              onClick={() => cvInputRef.current?.click()}
              disabled={uploadCvEnCours}
            >
              <FiUpload /> {profil.cvPath ? 'Remplacer le CV' : 'Téléverser un CV'}
            </button>

            {uploadCvEnCours && (
              <div style={{ marginTop: '0.85rem' }}>
                <div className="progress-wrap">
                  <div className="progress-bar" style={{ width: `${progressionCv}%`, background: 'var(--primary)' }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="card">
        <div className="card-header">
          <span className="card-title"><FiUser /> Informations générales</span>
        </div>
        <div className="card-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Prénom</label>
              <input className="form-input" value={form.prenom} onChange={(e) => majChamp('prenom', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Nom</label>
              <input className="form-input" value={form.nom} onChange={(e) => majChamp('nom', e.target.value)} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => majChamp('email', e.target.value)} required />
          </div>

          {profil.role === 'CANDIDAT' && (
            <>
              <div className="form-group">
                <label className="form-label">Téléphone</label>
                <input className="form-input" value={form.telephone} onChange={(e) => majChamp('telephone', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Compétences</label>
                <input className="form-input" value={form.competences} onChange={(e) => majChamp('competences', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Biographie</label>
                <textarea className="form-textarea" value={form.biographie} onChange={(e) => majChamp('biographie', e.target.value)} />
              </div>
            </>
          )}

          {profil.role === 'RECRUTEUR' && (
            <>
              <div className="form-group">
                <label className="form-label">Entreprise</label>
                <input className="form-input" value={form.entreprise} onChange={(e) => majChamp('entreprise', e.target.value)} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Secteur</label>
                  <input className="form-input" value={form.secteur} onChange={(e) => majChamp('secteur', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" value={form.telephone} onChange={(e) => majChamp('telephone', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Site web</label>
                <input className="form-input" value={form.siteWeb} onChange={(e) => majChamp('siteWeb', e.target.value)} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={enregistrement}>
            {enregistrement ? 'Enregistrement…' : <><FiSave /> Enregistrer</>}
          </button>
        </div>
      </form>

      <CarteSecurite />
    </div>
  );
}

function CarteSecurite() {
  const [ancienMotDePasse, setAncienMotDePasse] = useState('');
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (nouveauMotDePasse.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (nouveauMotDePasse !== confirmation) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setEnvoiEnCours(true);
    try {
      await authService.changePassword(ancienMotDePasse, nouveauMotDePasse);
      toast.success('Mot de passe changé avec succès !');
      setAncienMotDePasse('');
      setNouveauMotDePasse('');
      setConfirmation('');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="card" style={{ marginTop: '1.25rem' }}>
      <div className="card-header">
        <span className="card-title"><FiLock /> Sécurité</span>
        <span className="card-subtitle">Changer votre mot de passe</span>
      </div>
      <div className="card-body">
        <div className="form-group">
          <label className="form-label">Mot de passe actuel</label>
          <input
            type="password"
            className="form-input"
            value={ancienMotDePasse}
            onChange={(e) => setAncienMotDePasse(e.target.value)}
            required
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nouveau mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={nouveauMotDePasse}
              onChange={(e) => setNouveauMotDePasse(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirmer</label>
            <input
              type="password"
              className="form-input"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              required
            />
          </div>
        </div>
        <button type="submit" className="btn btn-outline" disabled={envoiEnCours}>
          {envoiEnCours ? 'Enregistrement…' : <><FiLock /> Changer le mot de passe</>}
        </button>
      </div>
    </form>
  );
}

export default MonProfil;
