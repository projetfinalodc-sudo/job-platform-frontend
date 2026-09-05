function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h3 style={{ color: 'var(--slate-600)', marginBottom: '0.4rem' }}>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div style={{ marginTop: '1.25rem' }}>{action}</div>}
    </div>
  );
}

export default EmptyState;
