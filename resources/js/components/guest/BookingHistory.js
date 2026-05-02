import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import PricingBreakdown from './PricingBreakdown';

export default function BookingHistory() {
  const { token } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    return statusMap[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase().replace('_', '-')}`;
  };

  if (isLoading) {
    return (
      <div className="booking-history">
        <h2>📋 My Bookings</h2>
        <div className="loading">Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="booking-history">
        <h2>📋 My Bookings</h2>
        <div className="alert alert-danger">⚠ {error}</div>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="booking-history">
        <h2>📋 My Bookings</h2>
        <div className="empty-state">
          <p>No bookings yet</p>
          <p>Browse our rooms and make your first reservation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-history">
      <h2>📋 My Bookings ({reservations.length})</h2>
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
                  <span className="label">📅 Check-in</span>
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
                  <span className="label">📅 Check-out</span>
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
                  <span className="label">⏱ Duration</span>
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
                  <strong>💬 Special Requests</strong>
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
                    ✕ Cancel Reservation
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
