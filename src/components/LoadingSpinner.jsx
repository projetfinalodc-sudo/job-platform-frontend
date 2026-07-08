function LoadingSpinner({ label }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div className="spinner" />
      {label && (
        <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem', marginTop: '-1rem' }}>
          {label}
        </p>
      )}
    </div>
  );
}

export default LoadingSpinner;
