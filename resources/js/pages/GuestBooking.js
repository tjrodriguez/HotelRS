import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import RoomBrowser from '../components/guest/RoomBrowser';
import BookingHistory from '../components/guest/BookingHistory';

export default function GuestBooking() {
  const { logout, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('browse');

  return (
    <div className="guest-booking">
      <header className="guest-header">
        <div className="header-content">
          <h1>🏨 Hotel Reservation System</h1>
          <div className="header-right">
            <span className="welcome">Welcome, {user?.name}</span>
            <button onClick={logout} className="btn btn-secondary">Logout</button>
          </div>
        </div>
      </header>

      <div className="guest-tabs">
        <button 
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          Browse & Book
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          My Bookings
        </button>
      </div>

      <main className="guest-main">
        {activeTab === 'browse' ? <RoomBrowser /> : <BookingHistory />}
      </main>
    </div>
  );
}
