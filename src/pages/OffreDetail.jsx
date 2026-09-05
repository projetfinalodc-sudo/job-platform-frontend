import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiMapPin, FiBriefcase, FiBook, FiDollarSign, FiCalendar, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import offreService from '../api/offreService';
import candidatureService from '../api/candidatureService';
import { extraireErreur } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function OffreDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [offre, setOffre] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [dejaPostule, setDejaPostule] = useState(false);

  useEffect(() => {
    let annule = false;
    setChargement(true);

    offreService.getById(id)
      .then((data) => { if (!annule) setOffre(data); })
      .catch((error) => {
        if (annule) return;
        const { status } = extraireErreur(error);
        if (status === 404) navigate('/404', { replace: true });
        else toast.error(extraireErreur(error).message);
      })
      .finally(() => { if (!annule) setChargement(false); });

    if (isAuthenticated && user?.role === 'CANDIDAT') {
      candidatureService.getMesCandidatures()
        .then((liste) => {
          if (!annule) setDejaPostule(liste.some((c) => c.offreId === Number(id)));
        })
        .catch(() => {});
    }

    return () => { annule = true; };
  }, [id, isAuthenticated, user, navigate]);

  if (chargement) return <LoadingSpinner label="Chargement de l'offre…" />;
  if (!offre) return null;

  const offreFermee = offre.statut !== 'ACTIVE';

  return (
    <div className="page-wrapper" style={{ maxWidth: 820 }}>
      <Link to="/offres" className="btn btn-ghost btn-sm" style={{ marginBottom: '1.5rem' }}>
        <FiArrowLeft /> Retour aux offres
      </Link>

      <div className="card">
        <div className="card-body">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div className="offre-card-logo" style={{ width: 64, height: 64, fontSize: '2rem' }}>🏢</div>
            <div>
              <h1 style={{ fontSize: '1.4rem', color: 'var(--slate-800)', marginBottom: '0.25rem' }}>
                {offre.titre}
              </h1>
              <p style={{ color: 'var(--primary)', fontWeight: 600 }}>{offre.entreprise}</p>
            </div>
          </div>

          <div className="offre-card-tags" style={{ marginBottom: '1.5rem' }}>
            {offre.typeContrat && <span className="badge badge-blue"><FiBriefcase /> {offre.typeContrat}</span>}
            {offre.niveauEtude && <span className="badge badge-violet"><FiBook /> {offre.niveauEtude}</span>}
            {offre.salaire && <span className="badge badge-green"><FiDollarSign /> {offre.salaire}</span>}
            <span className="badge badge-gray"><FiMapPin /> {offre.localisation}</span>
            {offreFermee && <span className="badge badge-red">Offre fermée</span>}
          </div>

          <h3 style={{ fontSize: '0.95rem', color: 'var(--slate-800)', marginBottom: '0.5rem' }}>
            Description du poste
          </h3>
          <p style={{ color: 'var(--slate-600)', lineHeight: 1.7, whiteSpace: 'pre-line', marginBottom: '1.5rem' }}>
            {offre.description}
          </p>

          {offre.dateExpiration && (
            <p style={{ color: 'var(--slate-400)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
              <FiCalendar /> Candidatures ouvertes jusqu'au {formaterDate(offre.dateExpiration)}
            </p>
          )}

          <BoutonPostuler
            offreId={offre.id}
            offreFermee={offreFermee}
            isAuthenticated={isAuthenticated}
            role={user?.role}
            dejaPostule={dejaPostule}
          />
        </div>
      </div>
    </div>
  );
}

function BoutonPostuler({ offreId, offreFermee, isAuthenticated, role, dejaPostule }) {
  if (offreFermee) {
    return <button className="btn btn-ghost btn-lg" disabled>Cette offre n'accepte plus de candidatures</button>;
  }
  if (!isAuthenticated) {
    return (
      <Link to="/login" state={{ from: `/offres/${offreId}` }} className="btn btn-primary btn-lg">
        Connectez-vous pour postuler
      </Link>
    );
  }
  if (role !== 'CANDIDAT') {
    return null;
  }
  if (dejaPostule) {
    return (
      <button className="btn btn-success btn-lg" disabled>
        <FiCheckCircle /> Vous avez déjà postulé
      </button>
    );
  }
  return (
    <Link to={`/offres/${offreId}/postuler`} className="btn btn-primary btn-lg">
      Postuler à cette offre
    </Link>
  );
}

function formaterDate(dateString) {
  return new Date(dateString).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default OffreDetail;
