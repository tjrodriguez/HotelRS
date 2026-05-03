import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function GuestLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout layout--guest">
      <header className="header" role="banner">
        <nav className="header__nav" aria-label="Guest navigation">
          <Link to="/book" className="header__link">Book a Room</Link>
          <Link to="/my-reservations" className="header__link">My Reservations</Link>
          <Link to="/my-payments" className="header__link">My Payments</Link>
          <button className="header__logout" onClick={handleLogout} type="button">
            Logout
          </button>
        </nav>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
