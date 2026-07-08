import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiArrowLeft, FiUploadCloud, FiFile, FiX, FiSend, FiEdit3, FiPaperclip,
} from 'react-icons/fi';
import offreService from '../api/offreService';
import candidatureService from '../api/candidatureService';
import utilisateurService from '../api/utilisateurService';
import { extraireErreur } from '../api/axiosClient';
import LoadingSpinner from '../components/LoadingSpinner';

const EXTENSIONS_AUTORISEES = ['.pdf', '.doc', '.docx'];
const TAILLE_MAX = 5 * 1024 * 1024; // 5 Mo

function Postuler() {
  const { id } = useParams();

  const [offre, setOffre] = useState(null);
  const [profil, setProfil] = useState(null);
  const [chargement, setChargement] = useState(true);

  const [cv, setCv] = useState(null);
  const [modeLettreFichier, setModeLettreFichier] = useState(true);
  const [lettreFichier, setLettreFichier] = useState(null);
  const [lettreTexte, setLettreTexte] = useState('');
  const [telephoneContact, setTelephoneContact] = useState('');
  const [dateDisponibilite, setDateDisponibilite] = useState('');

  const [erreurs, setErreurs] = useState({});
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [progression, setProgression] = useState(0);
  const [envoye, setEnvoye] = useState(false);

  const cvInputRef = useRef(null);
  const lettreInputRef = useRef(null);

  useEffect(() => {
    Promise.all([offreService.getById(id), utilisateurService.getMonProfil()])
      .then(([offreData, profilData]) => {
        setOffre(offreData);
        setProfil(profilData);
        setTelephoneContact(profilData.telephone || '');
      })
      .catch((error) => toast.error(extraireErreur(error).message))
      .finally(() => setChargement(false));
  }, [id]);

  const validerFichier = (file) => {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!EXTENSIONS_AUTORISEES.includes(extension)) {
      return 'Formats acceptés : PDF, DOC, DOCX uniquement.';
    }
    if (file.size > TAILLE_MAX) {
      return 'Le fichier dépasse la taille maximale de 5 Mo.';
    }
    return null;
  };

  const gererDepotCv = (file) => {
    const erreur = validerFichier(file);
    if (erreur) {
      setErreurs((e) => ({ ...e, cv: erreur }));
      toast.error(erreur);
      return;
    }
    setErreurs((e) => ({ ...e, cv: null }));
    setCv(file);
  };

  const gererDepotLettre = (file) => {
    const erreur = validerFichier(file);
    if (erreur) {
      toast.error(erreur);
      return;
    }
    setLettreFichier(file);
  };

  const validerFormulaire = () => {
    const nouvellesErreurs = {};
    if (!cv) nouvellesErreurs.cv = 'Le CV est obligatoire.';
    if (!telephoneContact.trim()) nouvellesErreurs.telephoneContact = 'Le téléphone est obligatoire.';
    if (!dateDisponibilite) nouvellesErreurs.dateDisponibilite = 'La date de disponibilité est obligatoire.';
    setErreurs(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validerFormulaire()) {
      toast.error('Merci de corriger les champs indiqués.');
      return;
    }

    setEnvoiEnCours(true);
    setProgression(0);
    try {
      await candidatureService.postuler(
        {
          offreId: offre.id,
          cv,
          lettreMotivationFichier: modeLettreFichier ? lettreFichier : null,
          lettreMotivationTexte: modeLettreFichier ? null : lettreTexte,
          telephoneContact,
          dateDisponibilite,
        },
        (pourcentage) => setProgression(pourcentage)
      );
      setEnvoye(true);
      toast.success('Candidature envoyée avec succès !');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  if (chargement) return <LoadingSpinner label="Préparation du formulaire…" />;
  if (!offre || !profil) return null;

  if (envoye) {
    return (
      <div className="page-wrapper" style={{ maxWidth: 560, textAlign: 'center', paddingTop: '3rem' }}>
        <div
          style={{
            width: 80, height: 80, borderRadius: '50%', background: '#d4edda',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem', fontSize: '2.2rem', color: 'var(--green)',
          }}
        >
          <FiSend />
        </div>
        <h2 style={{ color: 'var(--slate-800)', marginBottom: '0.5rem' }}>Candidature envoyée !</h2>
        <p style={{ color: 'var(--slate-500)', marginBottom: '2rem' }}>
          Votre candidature pour <strong>{offre.titre}</strong> chez <strong>{offre.entreprise}</strong> a
          bien été transmise. Le recruteur a été notifié.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/mes-candidatures" className="btn btn-primary">Voir mes candidatures</Link>
          <Link to="/offres" className="btn btn-ghost">Retour aux offres</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper" style={{ maxWidth: 700 }}>
      <Link to={`/offres/${id}`} className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
        <FiArrowLeft /> Retour à l'offre
      </Link>

      <div className="page-header">
        <div>
          <h1 className="page-title">Soumettre ma candidature</h1>
          <p className="page-subtitle">{offre.titre} — {offre.entreprise}</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        {/* Informations personnelles (pré-remplies, en lecture seule) */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-header">
            <span className="card-title">Informations personnelles</span>
          </div>
          <div className="card-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Prénom</label>
                <input className="form-input" value={profil.prenom} disabled />
              </div>
              <div className="form-group">
                <label className="form-label">Nom</label>
                <input className="form-input" value={profil.nom} disabled />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="form-input" value={profil.email} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Téléphone</label>
              <input
                className={`form-input ${erreurs.telephoneContact ? 'is-invalid' : ''}`}
                value={telephoneContact}
                onChange={(e) => setTelephoneContact(e.target.value)}
                placeholder="+224 6XX XX XX XX"
              />
              {erreurs.telephoneContact && <span className="form-error-text">{erreurs.telephoneContact}</span>}
            </div>
          </div>
        </div>

        {/* CV obligatoire */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-header">
            <span className="card-title">CV <span style={{ color: 'var(--red)' }}>*</span></span>
            <span className="card-subtitle">PDF, DOC ou DOCX — 5 Mo maximum</span>
          </div>
          <div className="card-body">
            <ZoneDepotFichier
              fichier={cv}
              onFichier={gererDepotCv}
              onSupprimer={() => setCv(null)}
              inputRef={cvInputRef}
              texte="Glissez votre CV ici ou cliquez pour parcourir"
            />
            {erreurs.cv && <span className="form-error-text">{erreurs.cv}</span>}
          </div>
        </div>

        {/* Lettre de motivation (optionnelle) */}
        <div className="card" style={{ marginBottom: '1.25rem' }}>
          <div className="card-header">
            <span className="card-title">Lettre de motivation (optionnelle)</span>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${modeLettreFichier ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setModeLettreFichier(true)}
              >
                <FiPaperclip /> Fichier
              </button>
              <button
                type="button"
                className={`btn btn-sm ${!modeLettreFichier ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setModeLettreFichier(false)}
              >
                <FiEdit3 /> Texte
              </button>
            </div>
          </div>
          <div className="card-body">
            {modeLettreFichier ? (
              <ZoneDepotFichier
                fichier={lettreFichier}
                onFichier={gererDepotLettre}
                onSupprimer={() => setLettreFichier(null)}
                inputRef={lettreInputRef}
                texte="Glissez votre lettre ici ou cliquez pour parcourir (facultatif)"
              />
            ) : (
              <textarea
                className="form-textarea"
                style={{ minHeight: 160 }}
                placeholder="Expliquez en quelques lignes pourquoi vous êtes le candidat idéal pour ce poste…"
                value={lettreTexte}
                onChange={(e) => setLettreTexte(e.target.value)}
              />
            )}
          </div>
        </div>

        {/* Disponibilité */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="card-header">
            <span className="card-title">Disponibilité <span style={{ color: 'var(--red)' }}>*</span></span>
          </div>
          <div className="card-body">
            <div className="form-group" style={{ marginBottom: 0, maxWidth: 260 }}>
              <label className="form-label">Date de disponibilité</label>
              <input
                type="date"
                className={`form-input ${erreurs.dateDisponibilite ? 'is-invalid' : ''}`}
                value={dateDisponibilite}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDateDisponibilite(e.target.value)}
              />
              {erreurs.dateDisponibilite && <span className="form-error-text">{erreurs.dateDisponibilite}</span>}
            </div>
          </div>
        </div>

        {envoiEnCours && (
          <div style={{ marginBottom: '1.25rem' }}>
            <div className="progress-wrap">
              <div
                className="progress-bar"
                style={{ width: `${progression}%`, background: 'var(--primary)' }}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '0.4rem' }}>
              Envoi en cours… {progression}%
            </p>
          </div>
        )}

        <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={envoiEnCours}>
          {envoiEnCours ? 'Envoi en cours…' : <><FiSend /> Envoyer ma candidature</>}
        </button>
      </form>
    </div>
  );
}

function ZoneDepotFichier({ fichier, onFichier, onSupprimer, inputRef, texte }) {
  const [dragActif, setDragActif] = useState(false);

  const gererDrop = (e) => {
    e.preventDefault();
    setDragActif(false);
    if (e.dataTransfer.files?.[0]) onFichier(e.dataTransfer.files[0]);
  };

  if (fichier) {
    return (
      <div className="file-preview">
        <div className="file-preview-info">
          <FiFile color="var(--green)" />
          <span>{fichier.name}</span>
          <span style={{ color: 'var(--slate-400)', flexShrink: 0 }}>
            ({(fichier.size / 1024 / 1024).toFixed(2)} Mo)
          </span>
        </div>
        <button type="button" className="file-preview-remove" onClick={onSupprimer}>
          <FiX />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`file-drop-zone ${dragActif ? 'drag-active' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragActif(true); }}
      onDragLeave={() => setDragActif(false)}
      onDrop={gererDrop}
    >
      <div className="drop-icon"><FiUploadCloud /></div>
      <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: 0 }}>{texte}</p>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        style={{ display: 'none' }}
        onChange={(e) => e.target.files?.[0] && onFichier(e.target.files[0])}
      />
    </div>
  );
}

export default Postuler;
