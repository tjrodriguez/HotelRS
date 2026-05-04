import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Wallet from '../guest/Wallet';
import Notifications from '../Notifications';

export default function GuestLayout() {
  const { logout, user } = useAuth();

  return (
    <div className="layout layout--guest">
      <header className="header" role="banner">
        <nav className="header__nav" aria-label="Guest navigation">
          <div className="header__brand-wrap">
            <Link to="/" className="header__brand" aria-label="Go to home">
              <span className="brand-mark" aria-hidden>
                <svg viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.6" strokeLinejoin="round">
                  <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z" />
                </svg>
              </span>
              <span className="brand-name">Luxe Stays</span>
            </Link>
            <p className="header__subtitle">Your reservation command center</p>
          </div>
          <div className="header__actions">
            <Notifications userType="guest" />
            <span className="header__welcome-chip">Hi, {user?.name || 'Guest'}</span>
            <Link to="/profile" className="header__link">Profile</Link>
            <button className="header__logout" onClick={logout} type="button">
              Logout
            </button>
          </div>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
      <Wallet />
    </div>
  );
}
