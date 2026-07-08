import { FiAlertTriangle } from 'react-icons/fi';

/**
 * Usage :
 * <ConfirmModal
 *   titre="Supprimer cette offre ?"
 *   message="Cette action est irréversible."
 *   onConfirm={() => ...}
 *   onCancel={() => setShow(false)}
 * />
 */
function ConfirmModal({ titre, message, confirmLabel = 'Confirmer', danger = true, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: danger ? '#fde8e8' : '#dce6f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem',
              fontSize: '1.5rem',
              color: danger ? 'var(--red)' : 'var(--primary)',
            }}
          >
            <FiAlertTriangle />
          </div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--slate-800)' }}>{titre}</h3>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.88rem', marginBottom: '1.75rem' }}>
            {message}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button className="btn btn-ghost" onClick={onCancel}>
              Annuler
            </button>
            <button
              className={danger ? 'btn btn-danger' : 'btn btn-primary'}
              onClick={onConfirm}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
