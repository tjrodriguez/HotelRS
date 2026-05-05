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
          <div className="header__content">
            <div className="header__brand-wrap">
              <Link to="/" className="header__brand" aria-label="Go to home">
                <span className="brand-mark" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
                    <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z" />
                  </svg>
                </span>
                <div className="brand-text">
                  <span className="brand-name">Luxe Stays</span>
                  <p className="header__subtitle">Reservations Hub</p>
                </div>
              </Link>
            </div>
            <div className="header__spacer" />
            <div className="header__actions">
              <Notifications userType="guest" />
              <div className="header__divider" />
              <span className="header__welcome-chip">
                <span className="header__avatar">{(user?.name || 'G')[0].toUpperCase()}</span>
                {user?.name || 'Guest'}
              </span>
              <Link to="/profile" className="header__link" aria-label="Go to profile">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
                </svg>
              </Link>
              <button className="header__logout" onClick={logout} type="button" aria-label="Logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 3l3 3m0 0l-3 3m3-3v6a1 1 0 0 1-1 1h-2" />
                </svg>
              </button>
            </div>
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
