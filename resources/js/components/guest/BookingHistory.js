import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';
import PricingBreakdown from './PricingBreakdown';

export default function BookingHistory() {
  const { token } = useAuth();
  const Icon = ({ type }) => {
    const icons = {
      list: <><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.8" /><path d="M8 8h8M8 12h8M8 16h5" strokeWidth="1.8" strokeLinecap="round" /></>,
      calendar: <><rect x="4" y="5" width="16" height="15" rx="2" strokeWidth="1.8" /><path d="M8 3v4M16 3v4M4 10h16" strokeWidth="1.8" strokeLinecap="round" /></>,
      clock: <><circle cx="12" cy="12" r="8" strokeWidth="1.8" /><path d="M12 8v5l3 2" strokeWidth="1.8" strokeLinecap="round" /></>,
      note: <><path d="M6 3h12a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 8h6" strokeWidth="1.8" strokeLinecap="round" /></>,
      checkCircle: <><circle cx="12" cy="12" r="9" strokeWidth="1.8" /><path d="M8 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></>,
      alertCircle: <><circle cx="12" cy="12" r="9" strokeWidth="1.8" /><path d="M12 8v4M12 16h.01" strokeWidth="1.8" strokeLinecap="round" /></>,
      xCircle: <><circle cx="12" cy="12" r="9" strokeWidth="1.8" /><path d="M15 9l-6 6M9 9l6 6" strokeWidth="1.8" strokeLinecap="round" /></>,
      info: <><circle cx="12" cy="12" r="9" strokeWidth="1.8" /><path d="M12 8v4M12 16h.01" strokeWidth="1.8" strokeLinecap="round" /></>,
      repeat: <><path d="M7 7h12v10M7 17l-2 2 2 2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M17 17l2 2-2 2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
    };

    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        {icons[type]}
      </svg>
    );
  };

  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const totalReservations = reservations.length;
  const upcomingReservations = reservations.filter((reservation) => {
    const status = String(reservation.status || '').toLowerCase();
    return ['pending', 'confirmed'].includes(status);
  }).length;

  const getFilteredReservations = () => {
    switch (activeFilter) {
      case 'upcoming':
        return reservations.filter((r) => {
          const status = String(r.status || '').toLowerCase();
          return ['pending', 'confirmed'].includes(status);
        });
      case 'past':
        return reservations.filter((r) => {
          const status = String(r.status || '').toLowerCase();
          return status === 'completed';
        });
      case 'cancelled':
        return reservations.filter((r) => String(r.status || '').toLowerCase() === 'cancelled');
      default:
        return reservations;
    }
  };

  useEffect(() => {
    if (token) fetchMyReservations();
  }, [token]);

  const fetchMyReservations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await apiClient.getReservations();
      setReservations(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.message || 'Failed to fetch reservations');
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await apiClient.cancelReservation(reservationId);
        setReservations((previous) =>
          previous.map((r) =>
            r.id === reservationId ? { ...r, status: 'cancelled' } : r
          )
        );
      } catch (err) {
        alert(`Error: ${err.message || 'Failed to cancel reservation'}`);
      }
    }
  };

  const handleCheckIn = async (reservationId) => {
    try {
      const data = await apiClient.checkInReservation(reservationId);
      setReservations((previous) =>
        previous.map((r) =>
          r.id === reservationId ? { ...r, checked_in_at: data.checked_in_at, status: data.status || r.status } : r
        )
      );
    } catch (err) {
      alert(`Error: ${err.message || 'Failed to check in'}`);
    }
  };

  const handleCheckOut = async (reservationId) => {
    try {
      const data = await apiClient.checkOutReservation(reservationId);
      setReservations((previous) =>
        previous.map((r) =>
          r.id === reservationId ? { ...r, checked_out_at: data.checked_out_at, status: data.status || r.status } : r
        )
      );
    } catch (err) {
      alert(`Error: ${err.message || 'Failed to check out'}`);
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: 'Pending Confirmation',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
    };
    const normalizedStatus = String(status || '').toLowerCase();
    return statusMap[normalizedStatus] || status || 'Unknown';
  };

  const getStatusIcon = (status) => {
    const normalizedStatus = String(status || '').toLowerCase();
    switch (normalizedStatus) {
      case 'confirmed':
      case 'completed':
        return 'checkCircle';
      case 'pending':
        return 'alertCircle';
      case 'cancelled':
        return 'xCircle';
      default:
        return 'info';
    }
  };

  const getBookingProgress = (reservation) => {
    const status = String(reservation.status || '').toLowerCase();
    const hasCheckedIn = !!reservation.checked_in_at;
    const hasCheckedOut = !!reservation.checked_out_at;

    let progress = 0;
    let stage = '';

    if (status === 'cancelled') {
      progress = 0;
      stage = 'cancelled';
    } else if (hasCheckedOut) {
      progress = 100;
      stage = 'completed';
    } else if (hasCheckedIn) {
      progress = 66;
      stage = 'checked-in';
    } else if (status === 'confirmed') {
      progress = 33;
      stage = 'confirmed';
    } else if (status === 'pending') {
      progress = 16;
      stage = 'pending';
    }

    return { progress, stage };
  };

  const getStatusClass = (status) => {
    return `status-${String(status || 'unknown').toLowerCase()}`;
  };

  if (isLoading) {
    return (
      <div className="booking-history">
        <div className="history-header">
          <h2 className="section-title"><span className="title-icon"><Icon type="list" /></span>My Bookings</h2>
          <p className="history-subtitle">Your reservations and stay details will appear here.</p>
        </div>
        <div className="loading booking-loading">
          <div className="spinner"></div>
          Loading your bookings...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-history">
        <div className="history-header">
          <h2 className="section-title"><span className="title-icon"><Icon type="list" /></span>My Bookings</h2>
          <p className="history-subtitle">Your reservations and stay details will appear here.</p>
        </div>
        <div className="form-error-banner">{error}</div>
      </div>
    );
  }

  const filteredReservations = getFilteredReservations();
  const upcomingCount = reservations.filter((r) => ['pending', 'confirmed'].includes(String(r.status || '').toLowerCase())).length;
  const pastCount = reservations.filter((r) => String(r.status || '').toLowerCase() === 'completed').length;
  const cancelledCount = reservations.filter((r) => String(r.status || '').toLowerCase() === 'cancelled').length;

  if (reservations.length === 0) {
    return (
      <div className="booking-history">
        <div className="history-header">
          <h2 className="section-title"><span className="title-icon"><Icon type="list" /></span>My Bookings</h2>
          <p className="history-subtitle">Track upcoming trips, cancellations, and completed stays.</p>
        </div>
        <div className="empty-state booking-empty-state">
          <div className="empty-icon"><Icon type="calendar" /></div>
          <h3>No bookings yet</h3>
          <p>Start your journey by browsing available rooms and making your first reservation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-history">
      <div className="history-header">
        <div>
          <h2 className="section-title"><span className="title-icon"><Icon type="list" /></span>My Bookings</h2>
          <p className="history-subtitle">{filteredReservations.length} of {totalReservations} reservation{totalReservations !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="booking-filters">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All <span className="filter-count">{totalReservations}</span>
        </button>
        <button
          className={`filter-btn ${activeFilter === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveFilter('upcoming')}
        >
          Upcoming <span className="filter-count">{upcomingCount}</span>
        </button>
        <button
          className={`filter-btn ${activeFilter === 'past' ? 'active' : ''}`}
          onClick={() => setActiveFilter('past')}
        >
          Past <span className="filter-count">{pastCount}</span>
        </button>
        {cancelledCount > 0 && (
          <button
            className={`filter-btn ${activeFilter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setActiveFilter('cancelled')}
          >
            Cancelled <span className="filter-count">{cancelledCount}</span>
          </button>
        )}
      </div>

      {filteredReservations.length === 0 ? (
        <div className="empty-state booking-empty-state">
          <div className="empty-icon"><Icon type="calendar" /></div>
          <h3>No {activeFilter !== 'all' ? activeFilter : ''} bookings</h3>
          <p>You don't have any {activeFilter !== 'all' ? activeFilter : ''} reservations at the moment.</p>
        </div>
      ) : (
        <div className="reservations-list">
          {filteredReservations.map((reservation) => {
            const nights = reservation.nights || 1;
            const basePrice = parseFloat(reservation.base_price || 0);
            const discountAmount = parseFloat(reservation.discount_amount || 0);
            const totalPrice = parseFloat(reservation.total_price || basePrice);
            const { progress, stage } = getBookingProgress(reservation);
            const checkInDate = new Date(reservation.check_in_date);
            const checkOutDate = new Date(reservation.check_out_date);
            const isUpcoming = checkInDate > new Date() && String(reservation.status || '').toLowerCase() !== 'cancelled';

            return (
              <div key={reservation.id} className={`reservation-card ${stage} ${isUpcoming ? 'upcoming' : ''}`}>
                <div className="reservation-card-header">
                  <div className="reservation-info">
                    <div className="room-header">
                      <div className="room-icon"><Icon type="calendar" /></div>
                      <div>
                        <h3>{reservation.room?.room_type?.name || 'Room'} #{reservation.room?.room_number}</h3>
                        <p className="reservation-id">Booking #{reservation.id}</p>
                      </div>
                    </div>
                  </div>
                  <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                    <span className="status-icon"><Icon type={getStatusIcon(reservation.status)} /></span>
                    {getStatusDisplay(reservation.status)}
                  </span>
                </div>

                <div className="booking-progress">
                  <div className="progress-bar-container">
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>

                <div className="reservation-details">
                  <div className="detail-group">
                    <span className="label"><span className="inline-icon"><Icon type="calendar" /></span>Check-in</span>
                    <span className="value">{checkInDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                    {!reservation.checked_in_at && isUpcoming && <span className="time-hint">{Math.ceil((checkInDate - new Date()) / (1000 * 60 * 60 * 24))} days away</span>}
                  </div>
                  <div className="detail-group">
                    <span className="label"><span className="inline-icon"><Icon type="calendar" /></span>Check-out</span>
                    <span className="value">{checkOutDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="detail-group">
                    <span className="label"><span className="inline-icon"><Icon type="clock" /></span>Duration</span>
                    <span className="value">{nights} night{nights !== 1 ? 's' : ''}</span>
                  </div>
                </div>

                {totalPrice > 0 && (
                  <PricingBreakdown
                    nights={nights}
                    basePrice={basePrice}
                    discountAmount={discountAmount}
                    totalPrice={totalPrice}
                    promotionCode={reservation.promotion?.code}
                  />
                )}

                {reservation.special_requests && (
                  <div className="special-requests">
                    <strong><span className="inline-icon"><Icon type="note" /></span>Special Requests</strong>
                    <p>{reservation.special_requests}</p>
                  </div>
                )}

                <div className="reservation-actions">
                  {reservation.status === 'pending' && (
                    <button
                      onClick={() => {
                        const checkInStr = checkInDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const checkOutStr = checkOutDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        const nightText = nights !== 1 ? 's' : '';
                        const roomType = reservation.room?.room_type?.name || 'Room';
                        const message = `Are you sure you want to cancel this ${roomType} booking for ${nights} night${nightText} (${checkInStr} - ${checkOutStr})?`;
                        if (confirm(message)) {
                          handleCancel(reservation.id);
                        }
                      }}
                      className="btn-cancel-res"
                      title="Cancel this pending reservation"
                    >
                      Cancel Reservation
                    </button>
                  )}
                  {reservation.status === 'confirmed' && !reservation.checked_in_at && (
                    <button
                      onClick={() => handleCheckIn(reservation.id)}
                      className="btn-primary btn-check-in"
                      title="Check in to your room"
                    >
                      <span className="btn-icon"><Icon type="checkCircle" /></span>
                      Check In
                    </button>
                  )}
                  {reservation.checked_in_at && !reservation.checked_out_at && (
                    <button
                      onClick={() => handleCheckOut(reservation.id)}
                      className="btn-primary btn-check-out"
                      title="Check out from your room"
                    >
                      <span className="btn-icon"><Icon type="checkCircle" /></span>
                      Check Out
                    </button>
                  )}
                  {reservation.status === 'completed' && (
                    <button
                      className="btn-rebook"
                      title="Book a similar room again"
                    >
                      <span className="btn-icon"><Icon type="repeat" /></span>
                      Rebook
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
