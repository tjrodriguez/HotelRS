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

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-left-content">
          <div className="brand-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M3 21V8a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v13" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 21V12h3v9M14 21V12h3v9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 7V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2>Luxe Stays</h2>
          <p>Premium Hotel Reservation System</p>
          <div className="features">
            <div className="feature-item">
              <div className="check-icon">✓</div>
              <span>Real-time room availability</span>
            </div>
            <div className="feature-item">
              <div className="check-icon">✓</div>
              <span>Secure booking management</span>
            </div>
            <div className="feature-item">
              <div className="check-icon">✓</div>
              <span>Exclusive promotions</span>
            </div>
            <div className="feature-item">
              <div className="check-icon">✓</div>
              <span>24/7 customer support</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h1>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
            <p>{isLogin ? 'Sign in to access your reservations' : 'Join our loyalty program'}</p>
          </div>

          {error && <div className="error-alert">{error}</div>}

          {isLogin && (
            <div className="role-selector">
              <button
                type="button"
                onClick={() => setRole('guest')}
                className={role === 'guest' ? 'active' : ''}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M3 21a9 9 0 0 1 18 0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Guest
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={role === 'admin' ? 'active' : ''}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M4 7h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Admin
              </button>
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email Address</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder={role === 'admin' ? 'admin@luxestays.com' : 'guest@luxestays.com'} required disabled={loading} />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required disabled={loading} />
              </div>

              <div className="checkbox-group">
                <input type="checkbox" id="remember" disabled={loading} />
                <label htmlFor="remember">Keep me signed in</label>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Signing in...' : 'Sign In'}</button>

              <div className="form-actions">
                <small>Try demo: admin@hotel.com / password</small>
                <button type="button">Need help?</button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="John Smith" required disabled={loading} />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required disabled={loading} />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" required disabled={loading} />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input name="passwordConfirmation" type="password" value={formData.passwordConfirmation} onChange={handleChange} placeholder="Repeat password" required disabled={loading} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary">{loading ? 'Creating account...' : 'Create Account'}</button>
            </form>
          )}

          <div className="toggle-mode">
            {isLogin ? 'No account?' : 'Have an account?'}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); setFormData({ name: '', email: '', password: '', passwordConfirmation: '' }); }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
