import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function Login() {
  const { login, register } = useContext(AuthContext);
  const [role, setRole] = useState('guest');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', password: '', passwordConfirmation: '' });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (formData.password !== formData.passwordConfirmation) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    try {
      await register(formData.name, formData.email, formData.password, formData.passwordConfirmation);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const primaryColor = role === 'admin' ? '#667eea' : '#14b8a6';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 40%, #14b8a6 100%)', padding: '24px' }}>
      <div style={{ width: '420px', background: 'white', borderRadius: 12, boxShadow: '0 10px 30px rgba(16,24,40,0.15)', padding: '28px' }}>
        <div style={{ textAlign: 'center', marginBottom: 18 }}>
          <div style={{ width: 56, height: 56, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(180deg,#fff 0%,#f3f4f6 100%)', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M3 21V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v13" stroke="#111827" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
              <path d="M7 21V12h3v9M14 21V12h3v9" stroke="#111827" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
              <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" stroke="#111827" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 style={{ margin: 0, fontSize: 22 }}>Hotel Reservation</h2>
          <p style={{ margin: '6px 0 0', color: '#6b7280' }}>{isLogin ? 'Sign in to continue' : 'Create your account'}</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: 8, marginBottom: 14 }}>{error}</div>}

        {isLogin && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => setRole('guest')}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: role === 'guest' ? `2px solid ${primaryColor}` : '1px solid #e5e7eb', background: role === 'guest' ? primaryColor : '#fff', color: role === 'guest' ? '#fff' : '#111827', fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke={role === 'guest' ? '#fff' : '#111827'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 21a9 9 0 0 1 18 0" stroke={role === 'guest' ? '#fff' : '#111827'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Guest
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              style={{ flex: 1, padding: '10px', borderRadius: 8, border: role === 'admin' ? `2px solid ${primaryColor}` : '1px solid #e5e7eb', background: role === 'admin' ? primaryColor : '#fff', color: role === 'admin' ? '#fff' : '#111827', fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M4 7h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7z" stroke={role === 'admin' ? '#fff' : '#111827'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 7V5a3 3 0 0 1 6 0v2" stroke={role === 'admin' ? '#fff' : '#111827'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Admin
            </button>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <label style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 6 }}>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder={role === 'admin' ? 'admin@hotel.com' : 'guest@hotel.com'} required disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 12 }} />

            <label style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 6 }}>Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 14 }} />

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 8, background: primaryColor, color: '#fff', border: 'none', fontWeight: 600 }}>{loading ? 'Signing in...' : 'Sign In'}</button>

            <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <small style={{ color: '#9ca3af' }}>Demo: admin@hotel.com / password</small>
              <a href="#" style={{ color: primaryColor, textDecoration: 'none', fontSize: 13 }}>Forgot?</a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <label style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 6 }}>Full name</label>
            <input name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 12 }} />

            <label style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 6 }}>Email</label>
            <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 12 }} />

            <label style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 6 }}>Password</label>
            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Create a password" required disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 12 }} />

            <label style={{ display: 'block', fontSize: 13, color: '#374151', marginBottom: 6 }}>Confirm password</label>
            <input name="passwordConfirmation" type="password" value={formData.passwordConfirmation} onChange={handleChange} placeholder="Repeat password" required disabled={loading} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 14 }} />

            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: 8, background: primaryColor, color: '#fff', border: 'none', fontWeight: 600 }}>{loading ? 'Creating account...' : 'Create account'}</button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setFormData({ name: '', email: '', password: '', passwordConfirmation: '' }); }} style={{ background: 'none', border: 'none', color: primaryColor, cursor: 'pointer', fontWeight: 600 }}>{isLogin ? 'Create an account' : 'Back to sign in'}</button>
        </div>
      </div>
    </div>
  );
}
