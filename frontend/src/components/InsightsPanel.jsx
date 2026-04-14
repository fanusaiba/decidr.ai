export default function InsightsPanel({ insights }) {
  if (!insights) {
    return (
      <div className="insights-panel empty">
        <p>Log at least 5 decisions<br />to unlock AI insights ✨</p>
      </div>
    );
  }

  return (
    <div className="insights-panel">
      <h3>⬡ AI Insights</h3>
      <div className="insight-cards">
        {insights.patterns?.map((p, i) => (
          <div key={i} className={`insight-card ${p.type || ''}`}>
            <span className="insight-icon">{p.icon}</span>
            <p>{p.message}</p>
          </div>
        ))}
      </div>
      <div className="insight-stats">
        <div className="stat">
          <span className="stat-val">{insights.bestTimeOfDay || '—'}</span>
          <span className="stat-label">peak time</span>
        </div>
        <div className="stat">
          <span className="stat-val">{insights.riskiestCategory || '—'}</span>
          <span className="stat-label">riskiest</span>
        </div>
        <div className="stat">
          <span className="stat-val">
            {insights.overallSuccessRate != null
              ? `${Math.round(insights.overallSuccessRate * 100)}%`
              : '—'}
          </span>
          <span className="stat-label">success rate</span>
        </div>
      </div>
    </div>
  );
}
