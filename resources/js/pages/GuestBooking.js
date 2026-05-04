import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RoomBrowser from '../components/guest/RoomBrowser';
import BookingHistory from '../components/guest/BookingHistory';

export default function GuestBooking() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = location.pathname === '/my-reservations' ? 'history' : 'browse';

  const Icon = ({ name }) => {
    const iconMap = {
      browse: (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.8" />
          <path d="M3 10h18M7 14h2" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ),
      bookings: (
        <>
          <rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.8" />
          <path d="M8 2v4M16 2v4M4 10h16" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ),
      star: (
        <path d="M12 3l2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9L12 3z" strokeWidth="1.6" strokeLinejoin="round" />
      ),
    };

    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        {iconMap[name]}
      </svg>
    );
  };

  return (
    <div className="guest-booking">
      <div className="guest-tabs">
        <button
          className={`tab-btn ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => navigate('/book')}
        >
          <span className="tab-icon" aria-hidden><Icon name="browse" /></span>
          Browse & Book
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => navigate('/my-reservations')}
        >
          <span className="tab-icon" aria-hidden><Icon name="bookings" /></span>
          My Bookings
        </button>
      </div>

      <main className="guest-main">
        {activeTab === 'browse' ? (
          <RoomBrowser showHero={false} />
        ) : (
          <BookingHistory />
        )}
      </main>
    </div>
  );
}
