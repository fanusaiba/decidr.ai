import './styles/globals.css';
import { AuthProvider, useAuth } from './hooks/useAuth.jsx';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/AuthPage';

function AppContent() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Space Mono', color: '#64748b', fontSize: '0.85rem' }}>
      // initializing...
    </div>
  );
  return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
