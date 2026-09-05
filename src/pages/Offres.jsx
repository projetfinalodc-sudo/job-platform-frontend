import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiMapPin, FiClock } from 'react-icons/fi';
import offreService from '../api/offreService';
import { extraireErreur } from '../api/axiosClient';
import EmptyState from '../components/EmptyState';

const PAR_PAGE = 9;

function Offres() {
  const [offres, setOffres] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [typeContratFiltre, setTypeContratFiltre] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    chargerOffres();
  }, []);

  const chargerOffres = async () => {
    setChargement(true);
    try {
      const data = await offreService.getToutes();
      setOffres(data);
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setChargement(false);
    }
  };

  const lancerRecherche = async (e) => {
    e.preventDefault();
    setPage(1);
    if (!recherche.trim()) {
      chargerOffres();
      return;
    }
    setChargement(true);
    try {
      const data = await offreService.rechercher(recherche.trim());
      setOffres(data);
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setChargement(false);
    }
  };

  const typesContrat = useMemo(
    () => [...new Set(offres.map((o) => o.typeContrat).filter(Boolean))],
    [offres]
  );

  const offresFiltrees = useMemo(
    () => offres.filter((o) => !typeContratFiltre || o.typeContrat === typeContratFiltre),
    [offres, typeContratFiltre]
  );

  const totalPages = Math.max(1, Math.ceil(offresFiltrees.length / PAR_PAGE));
  const offresPage = offresFiltrees.slice((page - 1) * PAR_PAGE, page * PAR_PAGE);

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Offres d'emploi</h1>
          <p className="page-subtitle">
            {chargement ? 'Chargement…' : `${offresFiltrees.length} offre(s) disponible(s)`}
          </p>
        </div>
      </div>

      <form className="search-bar" onSubmit={lancerRecherche}>
        <FiSearch color="var(--slate-400)" />
        <input
          className="form-input"
          placeholder="Rechercher un poste, une entreprise, une compétence…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 180 }}
          value={typeContratFiltre}
          onChange={(e) => { setTypeContratFiltre(e.target.value); setPage(1); }}
        >
          <option value="">Tous les contrats</option>
          {typesContrat.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary">Rechercher</button>
      </form>

      {chargement ? (
        <div className="offre-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="offre-card">
              <div className="skeleton" style={{ width: 48, height: 48, marginBottom: '1rem' }} />
              <div className="skeleton" style={{ width: '70%', height: 16, marginBottom: '0.5rem' }} />
              <div className="skeleton" style={{ width: '40%', height: 12, marginBottom: '1rem' }} />
              <div className="skeleton" style={{ width: '100%', height: 40 }} />
            </div>
          ))}
        </div>
      ) : offresPage.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="Aucune offre trouvée"
          description="Essayez d'élargir votre recherche ou vos filtres."
        />
      ) : (
        <>
          <div className="offre-grid">
            {offresPage.map((offre) => (
              <Link key={offre.id} to={`/offres/${offre.id}`} className="offre-card">
                <div className="offre-card-logo">🏢</div>
                <div className="offre-card-title">{offre.titre}</div>
                <div className="offre-card-company">{offre.entreprise}</div>
                <p className="offre-card-desc">{offre.description}</p>
                <div className="offre-card-tags">
                  {offre.typeContrat && <span className="badge badge-blue">{offre.typeContrat}</span>}
                  {offre.niveauEtude && <span className="badge badge-violet">{offre.niveauEtude}</span>}
                </div>
                <div className="offre-card-foot">
                  <span><FiMapPin /> {offre.localisation}</span>
                  <span><FiClock /> {formaterDate(offre.datePublication)}</span>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`btn btn-sm ${page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function formaterDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default Offres;
