const OUTCOME_COLOR = {
  positive: 'var(--good)',
  negative: 'var(--bad)',
  neutral: 'var(--warn)',
  pending: 'var(--muted)',
};

export default function DecisionList({ decisions }) {
  if (!decisions.length) {
    return (
      <div className="empty-state">
        <p>No decisions logged yet.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}>Start tracking to uncover your patterns 🚀</p>
      </div>
    );
  }

  return (
    <div>
      <div className="list-header">
        <h2>{decisions.length} decision{decisions.length !== 1 ? 's' : ''} tracked</h2>
      </div>
      <div className="decision-list">
        {decisions.map(d => (
          <div key={d._id} className="decision-card">
            <div className="dc-header">
              <span className="dc-category">{d.category}</span>
              <span className="dc-time">
                {d.timeOfDay} · {new Date(d.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric'
                })}
              </span>
            </div>
            <h4 className="dc-title">{d.title}</h4>
            {d.description && <p className="dc-desc">{d.description}</p>}
            <div className="dc-footer">
              <span className="dc-mood">{d.mood}</span>
              {d.prediction?.successProbability != null && (
                <span
                  className="dc-prob"
                  style={{
                    color: d.prediction.successProbability > 0.65
                      ? 'var(--good)'
                      : d.prediction.successProbability > 0.45
                        ? 'var(--warn)'
                        : 'var(--bad)'
                  }}
                >
                  {Math.round(d.prediction.successProbability * 100)}% success
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
