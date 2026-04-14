import { useState } from 'react';

const CATEGORIES = ['study', 'sleep', 'spending', 'health', 'social', 'work', 'other'];
const MOODS = ['😤 stressed', '😴 tired', '😐 neutral', '😊 good', '🔥 great'];

export default function DecisionForm({ onSubmit, onPredict }) {
  const [form, setForm] = useState({
    title: '',
    category: 'study',
    description: '',
    mood: '😊 good',
    timeOfDay: 'morning',
    expectedOutcome: 'positive',
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePredict = async () => {
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      const result = await onPredict(form);
      setPrediction(result.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      await onSubmit({ ...form, prediction });
      setForm({ title: '', category: 'study', description: '', mood: '😊 good', timeOfDay: 'morning', expectedOutcome: 'positive' });
      setPrediction(null);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const probColor = prediction
    ? prediction.successProbability > 0.65
      ? 'var(--good)'
      : prediction.successProbability > 0.45
        ? 'var(--warn)'
        : 'var(--bad)'
    : 'var(--text)';

  return (
    <div className="decision-form">
      <h2>⬡ Log a Decision</h2>
      <div className="form-grid">
        <input
          className="input"
          placeholder="What decision did you make?"
          value={form.title}
          onChange={e => set('title', e.target.value)}
        />
        <textarea
          className="input textarea"
          placeholder="Describe the context or reasoning..."
          value={form.description}
          onChange={e => set('description', e.target.value)}
        />
        <div className="form-row">
          <select className="input select" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input select" value={form.timeOfDay} onChange={e => set('timeOfDay', e.target.value)}>
            {['morning', 'afternoon', 'evening', 'night'].map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div className="mood-row">
          {MOODS.map(m => (
            <button
              key={m}
              className={`mood-btn ${form.mood === m ? 'active' : ''}`}
              onClick={() => set('mood', m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {prediction && (
        <div className="prediction-card">
          <div className="pred-score" style={{ color: probColor }}>
            {Math.round(prediction.successProbability * 100)}%
          </div>
          <div className="pred-label">success probability</div>
          <p className="pred-impact">{prediction.longTermImpact}</p>
          <div className="pred-tags">
            {prediction.factors?.map((f, i) => (
              <span key={i} className="tag">{f}</span>
            ))}
          </div>
        </div>
      )}

      <div className="form-actions">
        <button className="btn btn-ghost" onClick={handlePredict} disabled={!form.title.trim() || loading}>
          {loading ? 'Analyzing...' : '🔮 Predict'}
        </button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!form.title.trim() || submitting}>
          {submitting ? 'Logging...' : 'Log →'}
        </button>
      </div>
    </div>
  );
}
