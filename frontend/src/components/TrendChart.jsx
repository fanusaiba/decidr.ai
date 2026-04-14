import { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { api } from '../utils/api';

const CATEGORY_COLORS = {
  study: '#06b6d4',
  health: '#10b981',
  work: '#7c3aed',
  social: '#f59e0b',
  sleep: '#6366f1',
  spending: '#ef4444',
  other: '#64748b',
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#111118', border: '1px solid #1e1e2e',
      borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.8rem',
    }}>
      <p style={{ color: '#64748b', marginBottom: 4, fontFamily: 'Space Mono' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color, fontFamily: 'Space Mono' }}>
          {p.name}: {typeof p.value === 'number' ? `${Math.round(p.value * 100)}%` : p.value}
        </p>
      ))}
    </div>
  );
};

export default function TrendChart() {
  const [data, setData] = useState(null);
  const [view, setView] = useState('timeline'); // 'timeline' | 'category'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChart = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/decisions/chart`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        const json = await res.json();
        setData(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchChart();
  }, []);

  if (loading) return <div className="loading">// loading chart data...</div>;
  if (!data || data.timeline.length < 2) {
    return (
      <div className="chart-empty">
        Log at least 2 decisions to see trend charts 📈
      </div>
    );
  }

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h2 className="chart-title">Decision Trends</h2>
        <div className="chart-tabs">
          <button className={`chart-tab ${view === 'timeline' ? 'active' : ''}`} onClick={() => setView('timeline')}>Timeline</button>
          <button className={`chart-tab ${view === 'category' ? 'active' : ''}`} onClick={() => setView('category')}>By Category</button>
        </div>
      </div>

      {view === 'timeline' && (
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data.timeline} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Space Mono' }} />
            <YAxis domain={[0, 1]} tickFormatter={v => `${Math.round(v * 100)}%`}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Space Mono' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="successProbability"
              name="Success Prob"
              stroke="#7c3aed"
              strokeWidth={2}
              dot={{ fill: '#7c3aed', r: 4 }}
              activeDot={{ r: 6, fill: '#06b6d4' }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {view === 'category' && (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data.byCategory} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="category" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Space Mono' }} />
            <YAxis domain={[0, 1]} tickFormatter={v => `${Math.round(v * 100)}%`}
              tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'Space Mono' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="avgProb" name="Avg Success" radius={[4, 4, 0, 0]}>
              {data.byCategory.map((entry, i) => (
                <Cell key={i} fill={CATEGORY_COLORS[entry.category] || '#64748b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
