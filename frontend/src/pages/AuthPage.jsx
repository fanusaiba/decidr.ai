import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import '../styles/auth.css';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

 const handleSubmit = async () => {
  setError('');

  if (!form.email || !form.password) {
    setError('Email and password required');
    return;
  }

  if (mode === 'register' && !form.name) {
    setError('Name required');
    return;
  }

  setLoading(true);

  try {
    const res =
      mode === 'login'
        ? await login(form)
        : await register(form);

    // ✅ SHOW REAL BACKEND ERROR
    if (res.error) {
      setError(res.error);
    }

  } catch (e) {
    // ✅ SHOW ACTUAL ERROR MESSAGE
    setError(e.message || 'Something went wrong');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">DECIDR<span className="auth-logo-ai">·AI</span></div>
        <p className="auth-tagline">track decisions · learn from patterns</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${mode === 'login' ? 'active' : ''}`} onClick={() => setMode('login')}>
            Login
          </button>
          <button className={`auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>
            Register
          </button>
        </div>

        <div className="auth-form">
          {mode === 'register' && (
            <input
              className="input"
              placeholder="Full name"
              value={form.name}
              onChange={e => set('name', e.target.value)}
            />
          )}
          <input
            className="input"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={e => set('email', e.target.value)}
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
          {error && <p className="auth-error">{error}</p>}
          <button className="btn btn-primary auth-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Loading...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </div>
      </div>
    </div>
  );
}
