import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import notificationService from '../api/notificationService';
import { extraireErreur } from '../api/axiosClient';

const ICONES_PAR_TYPE = {
  NOUVELLE_OFFRE: '📋',
  NOUVELLE_CANDIDATURE: '👤',
  CANDIDATURE_ACCEPTEE: '🎉',
  CANDIDATURE_REFUSEE: '📩',
};

function NotificationBell() {
  const navigate = useNavigate();
  const [ouvert, setOuvert] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [nonLues, setNonLues] = useState(0);
  const [charge, setCharge] = useState(false);
  const menuRef = useRef(null);

  const rafraichirCompteur = useCallback(() => {
    notificationService.compterNonLues().then(setNonLues).catch(() => {});
  }, []);

  // Rafraîchit le compteur au montage, puis toutes les 30 secondes
  useEffect(() => {
    rafraichirCompteur();
    const interval = setInterval(rafraichirCompteur, 30000);
    return () => clearInterval(interval);
  }, [rafraichirCompteur]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOuvert(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const ouvrirMenu = () => {
    setOuvert((v) => !v);
    if (!ouvert && notifications.length === 0) {
      setCharge(true);
      notificationService.getMesNotifications()
        .then(setNotifications)
        .catch((error) => toast.error(extraireErreur(error).message))
        .finally(() => setCharge(false));
    }
  };

  const cliquerNotification = async (n) => {
    if (!n.lu) {
      try {
        await notificationService.marquerCommeLue(n.id);
        setNotifications((liste) => liste.map((x) => (x.id === n.id ? { ...x, lu: true } : x)));
        setNonLues((c) => Math.max(0, c - 1));
      } catch {
        // silencieux : la navigation reste possible même si le marquage échoue
      }
    }
    setOuvert(false);
    if (n.lien) navigate(n.lien);
  };

  const toutMarquerLu = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.marquerToutesCommeLues();
      setNotifications((liste) => liste.map((x) => ({ ...x, lu: true })));
      setNonLues(0);
    } catch (error) {
      toast.error(extraireErreur(error).message);
    }
  };

  const supprimerNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.supprimer(id);
      setNotifications((liste) => liste.filter((x) => x.id !== id));
    } catch (error) {
      toast.error(extraireErreur(error).message);
    }
  };

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <div
        onClick={ouvrirMenu}
        style={{ position: 'relative', cursor: 'pointer', padding: '0.5rem', fontSize: '1.2rem', color: 'var(--slate-500)' }}
        title="Notifications"
      >
        <FiBell />
        {nonLues > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 2, background: 'var(--red)', color: '#fff',
            borderRadius: '999px', fontSize: '0.65rem', fontWeight: 700, minWidth: 16, height: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px',
          }}>
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </div>

      {ouvert && (
        <div className="card" style={{
          position: 'absolute', right: 0, top: '48px', width: '340px', maxHeight: '420px',
          overflowY: 'auto', zIndex: 200,
        }}>
          <div className="card-header">
            <span className="card-title">Notifications</span>
            {nonLues > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={toutMarquerLu}>
                <FiCheck /> Tout marquer lu
              </button>
            )}
          </div>

          {charge ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
              Chargement…
            </div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
              Aucune notification pour le moment.
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => cliquerNotification(n)}
                style={{
                  display: 'flex', gap: '0.65rem', padding: '0.85rem 1rem',
                  borderBottom: '1px solid #f5f5f5', cursor: 'pointer',
                  background: n.lu ? 'transparent' : '#f0fdf9',
                }}
              >
                <div style={{ fontSize: '1.2rem', flexShrink: 0 }}>
                  {ICONES_PAR_TYPE[n.type] || '🔔'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.83rem', fontWeight: n.lu ? 500 : 700, color: 'var(--slate-800)' }}>
                    {n.titre}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: 2 }}>
                    {n.message}
                  </div>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  style={{ padding: '0.3rem', flexShrink: 0, alignSelf: 'flex-start' }}
                  onClick={(e) => supprimerNotification(e, n.id)}
                  title="Supprimer"
                >
                  <FiTrash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
