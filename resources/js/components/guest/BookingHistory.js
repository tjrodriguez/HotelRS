import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import PricingBreakdown from './PricingBreakdown';

export default function BookingHistory() {
  const Icon = ({ type }) => {
    const icons = {
      list: <><rect x="4" y="4" width="16" height="16" rx="2" strokeWidth="1.8" /><path d="M8 8h8M8 12h8M8 16h5" strokeWidth="1.8" strokeLinecap="round" /></>,
      calendar: <><rect x="4" y="5" width="16" height="15" rx="2" strokeWidth="1.8" /><path d="M8 3v4M16 3v4M4 10h16" strokeWidth="1.8" strokeLinecap="round" /></>,
      clock: <><circle cx="12" cy="12" r="8" strokeWidth="1.8" /><path d="M12 8v5l3 2" strokeWidth="1.8" strokeLinecap="round" /></>,
      note: <><path d="M6 3h12a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z" strokeWidth="1.8" strokeLinejoin="round" /><path d="M9 8h6" strokeWidth="1.8" strokeLinecap="round" /></>,
    };

    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        {icons[type]}
      </svg>
    );
  };

  const { token } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const totalReservations = reservations.length;
  const upcomingReservations = reservations.filter((reservation) => {
    const status = String(reservation.status || '').toLowerCase();
    return ['pending', 'confirmed'].includes(status);
  }).length;

  useEffect(() => {
    fetchMyReservations();
  }, [token]);

  const fetchMyReservations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch('/api/reservations', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      setReservations(Array.isArray(data) ? data : data.data || []);
    } catch (err) {
      console.error('Error fetching reservations:', err);
      setError(err.message);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      try {
        const response = await fetch(`/api/reservations/${reservationId}/cancel`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to cancel reservation');
        }

        setReservations(
          reservations.map((r) =>
            r.id === reservationId ? { ...r, status: 'cancelled' } : r
          )
        );
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      pending: 'Pending Confirmation',
      confirmed: 'Confirmed',
      checked_in: 'Checked In',
      checked_out: 'Checked Out',
      cancelled: 'Cancelled',
    };
    const normalizedStatus = String(status || '').toLowerCase();
    return statusMap[normalizedStatus] || status || 'Unknown';
  };

  const getStatusClass = (status) => {
    return `status-${String(status || 'unknown').toLowerCase().replace(/_/g, '-')}`;
  };

  if (isLoading) {
    return (
      <div className="booking-history">
        <div className="history-header">
          <h2 className="section-title"><span className="title-icon"><Icon type="list" /></span>My Bookings</h2>
          <p className="history-subtitle">Your reservations and stay details will appear here.</p>
        </div>
        <div className="loading booking-loading">Loading your bookings...</div>
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
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="booking-history">
        <div className="history-header">
          <h2 className="section-title"><span className="title-icon"><Icon type="list" /></span>My Bookings</h2>
          <p className="history-subtitle">Track upcoming trips, cancellations, and completed stays.</p>
        </div>
        <div className="history-summary">
          <div className="summary-pill">
            <span className="summary-number">0</span>
            <span className="summary-label">Total bookings</span>
          </div>
          <div className="summary-pill accent">
            <span className="summary-number">0</span>
            <span className="summary-label">Upcoming</span>
          </div>
        </div>
        <div className="empty-state booking-empty-state">
          <p>No bookings yet</p>
          <p>Browse our rooms and make your first reservation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-history">
      <div className="history-header">
        <h2 className="section-title"><span className="title-icon"><Icon type="list" /></span>My Bookings ({totalReservations})</h2>
        <p className="history-subtitle">Track upcoming trips, cancellations, and completed stays.</p>
      </div>

      <div className="history-summary">
        <div className="summary-pill">
          <span className="summary-number">{totalReservations}</span>
          <span className="summary-label">Total bookings</span>
        </div>
        <div className="summary-pill accent">
          <span className="summary-number">{upcomingReservations}</span>
          <span className="summary-label">Upcoming</span>
        </div>
      </div>

      <div className="reservations-list">
        {reservations.map((reservation) => {
          const nights = reservation.nights || 1;
          const basePrice = parseFloat(reservation.base_price || 0);
          const discountAmount = parseFloat(reservation.discount_amount || 0);
          const totalPrice = parseFloat(reservation.total_price || basePrice);

          return (
            <div key={reservation.id} className="reservation-card">
              <div className="reservation-card-header">
                <div className="reservation-info">
                  <h3>
                    {reservation.room?.room_type?.name || 'Room'} #{reservation.room?.room_number}
                  </h3>
                  <p className="reservation-id">Booking #{reservation.id}</p>
                </div>
                <span className={`status-badge ${getStatusClass(reservation.status)}`}>
                  {getStatusDisplay(reservation.status)}
                </span>
              </div>

              <div className="reservation-details">
                <div className="detail-group">
                  <span className="label"><span className="inline-icon"><Icon type="calendar" /></span>Check-in</span>
                  <span className="value">
                    {new Date(reservation.check_in_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="detail-group">
                  <span className="label"><span className="inline-icon"><Icon type="calendar" /></span>Check-out</span>
                  <span className="value">
                    {new Date(reservation.check_out_date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
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

              {reservation.status === 'pending' && (
                <div className="reservation-actions">
                  <button
                    onClick={() => {
                      const checkInStr = new Date(reservation.check_in_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
                      const checkOutStr = new Date(reservation.check_out_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
