import { useDecisions } from '../hooks/useDecisions';
import { useAuth } from '../hooks/useAuth.jsx';
import DecisionForm from '../components/DecisionForm';
import DecisionList from '../components/DecisionList';
import InsightsPanel from '../components/InsightsPanel';
import TrendChart from '../components/TrendChart';
import '../styles/dashboard.css';

export default function Dashboard() {
  const { decisions, insights, loading, logDecision, predict } = useDecisions();
  const { user, logout } = useAuth();

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="header-top">
          <div className="logo">DECIDR<span className="logo-ai">·AI</span></div>
          <div className="header-right">
            {user && <span className="header-user">{user.name}</span>}
            <button className="btn-logout" onClick={logout}>logout</button>
          </div>
        </div>
        <p className="tagline">track decisions · detect patterns · decide better</p>
      </header>

      <div className="chart-section">
        <TrendChart />
      </div>

      <div className="dash-grid">
        <aside className="sidebar">
          <DecisionForm onSubmit={logDecision} onPredict={predict} />
          <InsightsPanel insights={insights} />
        </aside>
        <main className="main-content">
          {loading
            ? <div className="loading">// loading decisions...</div>
            : <DecisionList decisions={decisions} />
          }
        </main>
      </div>
    </div>
  );
}
