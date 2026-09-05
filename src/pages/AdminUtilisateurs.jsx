import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiSearch, FiUserPlus, FiEdit2, FiTrash2, FiLock, FiUnlock, FiX, FiSave,
} from 'react-icons/fi';
import utilisateurService from '../api/utilisateurService';
import { extraireErreur } from '../api/axiosClient';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import ConfirmModal from '../components/ConfirmModal';

const ROLE_BADGE = { CANDIDAT: 'badge-blue', RECRUTEUR: 'badge-violet', ADMIN: 'badge-red' };

function AdminUtilisateurs() {
  const { user: adminConnecte } = useAuth();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [recherche, setRecherche] = useState('');
  const [filtreRole, setFiltreRole] = useState('');

  const [utilisateurEnEdition, setUtilisateurEnEdition] = useState(null); // null | {} (création) | objet (édition)
  const [utilisateurASupprimer, setUtilisateurASupprimer] = useState(null);
  const [utilisateurASuspendre, setUtilisateurASuspendre] = useState(null);

  useEffect(() => {
    chargerUtilisateurs();
  }, []);

  const chargerUtilisateurs = () => {
    setChargement(true);
    utilisateurService.admin.getTous()
      .then(setUtilisateurs)
      .catch((error) => toast.error(extraireErreur(error).message))
      .finally(() => setChargement(false));
  };

  const utilisateursFiltres = useMemo(() => {
    return utilisateurs.filter((u) => {
      const matchRole = !filtreRole || u.role === filtreRole;
      const texte = `${u.nom} ${u.prenom} ${u.email}`.toLowerCase();
      const matchRecherche = !recherche || texte.includes(recherche.toLowerCase());
      return matchRole && matchRecherche;
    });
  }, [utilisateurs, filtreRole, recherche]);

  const confirmerSuppression = async () => {
    try {
      await utilisateurService.admin.supprimer(utilisateurASupprimer.id);
      setUtilisateurs((liste) => liste.filter((u) => u.id !== utilisateurASupprimer.id));
      toast.success('Utilisateur supprimé !');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setUtilisateurASupprimer(null);
    }
  };

  const confirmerChangementStatut = async () => {
    const nouveauStatut = !utilisateurASuspendre.actif;
    try {
      const maj = await utilisateurService.admin.changerStatut(utilisateurASuspendre.id, nouveauStatut);
      setUtilisateurs((liste) => liste.map((u) => (u.id === maj.id ? maj : u)));
      toast.success(nouveauStatut ? 'Utilisateur réactivé !' : 'Utilisateur suspendu !');
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setUtilisateurASuspendre(null);
    }
  };

  if (chargement) return <LoadingSpinner label="Chargement des utilisateurs…" />;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des utilisateurs</h1>
          <p className="page-subtitle">{utilisateurs.length} utilisateur(s) au total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setUtilisateurEnEdition({})}>
          <FiUserPlus /> Créer un utilisateur
        </button>
      </div>

      <div className="search-bar">
        <FiSearch color="var(--slate-400)" />
        <input
          className="form-input"
          placeholder="Rechercher par nom, prénom ou e-mail…"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
        />
        <select className="form-select" style={{ maxWidth: 180 }} value={filtreRole} onChange={(e) => setFiltreRole(e.target.value)}>
          <option value="">Tous les rôles</option>
          <option value="CANDIDAT">Candidat</option>
          <option value="RECRUTEUR">Recruteur</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {utilisateursFiltres.length === 0 ? (
        <EmptyState icon="👤" title="Aucun utilisateur trouvé" description="Essayez d'ajuster votre recherche." />
      ) : (
        <div className="table-wrap card">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>E-mail confirmé</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {utilisateursFiltres.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--slate-800)' }}>{u.prenom} {u.nom}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>{u.email}</div>
                  </td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] || 'badge-gray'}`}>{u.role}</span></td>
                  <td>
                    <span className={`badge ${u.actif ? 'badge-green' : 'badge-red'}`}>
                      {u.actif ? 'Actif' : 'Suspendu'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.enabled ? 'badge-green' : 'badge-amber'}`}>
                      {u.enabled ? 'Confirmé' : 'En attente'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setUtilisateurEnEdition(u)}>
                        <FiEdit2 />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setUtilisateurASuspendre(u)}
                        disabled={u.email === adminConnecte.email}
                        title={u.email === adminConnecte.email ? 'Vous ne pouvez pas vous suspendre vous-même' : ''}
                      >
                        {u.actif ? <FiLock color="var(--amber)" /> : <FiUnlock color="var(--green)" />}
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setUtilisateurASupprimer(u)}
                        disabled={u.email === adminConnecte.email}
                        title={u.email === adminConnecte.email ? 'Vous ne pouvez pas vous supprimer vous-même' : ''}
                      >
                        <FiTrash2 color="var(--red)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {utilisateurEnEdition && (
        <FormulaireUtilisateur
          utilisateur={utilisateurEnEdition}
          onClose={() => setUtilisateurEnEdition(null)}
          onSucces={(maj, estCreation) => {
            setUtilisateurs((liste) =>
              estCreation ? [...liste, maj] : liste.map((u) => (u.id === maj.id ? maj : u))
            );
            setUtilisateurEnEdition(null);
          }}
        />
      )}

      {utilisateurASupprimer && (
        <ConfirmModal
          titre="Supprimer cet utilisateur ?"
          message={`${utilisateurASupprimer.prenom} ${utilisateurASupprimer.nom} sera définitivement supprimé.`}
          confirmLabel="Supprimer"
          onConfirm={confirmerSuppression}
          onCancel={() => setUtilisateurASupprimer(null)}
        />
      )}

      {utilisateurASuspendre && (
        <ConfirmModal
          titre={utilisateurASuspendre.actif ? 'Suspendre cet utilisateur ?' : 'Réactiver cet utilisateur ?'}
          message={
            utilisateurASuspendre.actif
              ? `${utilisateurASuspendre.prenom} ${utilisateurASuspendre.nom} ne pourra plus se connecter.`
              : `${utilisateurASuspendre.prenom} ${utilisateurASuspendre.nom} pourra de nouveau se connecter.`
          }
          confirmLabel={utilisateurASuspendre.actif ? 'Suspendre' : 'Réactiver'}
          danger={utilisateurASuspendre.actif}
          onConfirm={confirmerChangementStatut}
          onCancel={() => setUtilisateurASuspendre(null)}
        />
      )}
    </div>
  );
}

function FormulaireUtilisateur({ utilisateur, onClose, onSucces }) {
  const estCreation = !utilisateur.id;
  const [form, setForm] = useState({
    nom: utilisateur.nom || '',
    prenom: utilisateur.prenom || '',
    email: utilisateur.email || '',
    motDePasse: '',
    role: utilisateur.role || 'CANDIDAT',
    actif: utilisateur.actif ?? true,
    telephone: utilisateur.telephone || '',
    competences: utilisateur.competences || '',
    entreprise: utilisateur.entreprise || '',
    secteur: utilisateur.secteur || '',
  });
  const [envoiEnCours, setEnvoiEnCours] = useState(false);

  const majChamp = (champ, valeur) => setForm((f) => ({ ...f, [champ]: valeur }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setEnvoiEnCours(true);
    try {
      let resultat;
      if (estCreation) {
        resultat = await utilisateurService.admin.creer(form);
      } else {
        resultat = await utilisateurService.admin.modifier(utilisateur.id, form);
      }
      toast.success(estCreation ? 'Utilisateur créé !' : 'Utilisateur modifié !');
      onSucces(resultat, estCreation);
    } catch (error) {
      toast.error(extraireErreur(error).message);
    } finally {
      setEnvoiEnCours(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="card-header">
          <span className="card-title">{estCreation ? 'Créer un utilisateur' : "Modifier l'utilisateur"}</span>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="card-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
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

            {estCreation && (
              <div className="form-group">
                <label className="form-label">Mot de passe</label>
                <input type="password" className="form-input" value={form.motDePasse} onChange={(e) => majChamp('motDePasse', e.target.value)} required minLength={6} />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Rôle</label>
              <select className="form-select" value={form.role} onChange={(e) => majChamp('role', e.target.value)} disabled={!estCreation}>
                <option value="CANDIDAT">Candidat</option>
                <option value="RECRUTEUR">Recruteur</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            {form.role === 'CANDIDAT' && (
              <>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input className="form-input" value={form.telephone} onChange={(e) => majChamp('telephone', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Compétences</label>
                  <input className="form-input" value={form.competences} onChange={(e) => majChamp('competences', e.target.value)} />
                </div>
              </>
            )}

            {form.role === 'RECRUTEUR' && (
              <>
                <div className="form-group">
                  <label className="form-label">Entreprise</label>
                  <input className="form-input" value={form.entreprise} onChange={(e) => majChamp('entreprise', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Secteur</label>
                  <input className="form-input" value={form.secteur} onChange={(e) => majChamp('secteur', e.target.value)} />
                </div>
              </>
            )}

            {!estCreation && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                <input type="checkbox" checked={form.actif} onChange={(e) => majChamp('actif', e.target.checked)} />
                Compte actif
              </label>
            )}
          </div>
          <div className="card-body" style={{ borderTop: '1px solid #f0f0f0', display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn btn-ghost" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={envoiEnCours}>
              {envoiEnCours ? 'Enregistrement…' : <><FiSave /> Enregistrer</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminUtilisateurs;
