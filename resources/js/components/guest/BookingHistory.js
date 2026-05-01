import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';

export default function BookingHistory() {
  const { token } = useContext(AuthContext);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchMyReservations();
  }, [token]);

  const fetchMyReservations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/guest/reservations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    if (confirm('Are you sure you want to cancel this reservation?')) {
      try {
        const response = await fetch(`/api/guest/reservations/${reservationId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          setReservations(reservations.filter((r) => r.id !== reservationId));
        }
      } catch (error) {
        console.error('Error cancelling reservation:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="loading">Loading your bookings...</div>;
  }

  if (reservations.length === 0) {
    return <div className="empty-state">You haven't made any bookings yet. Start exploring rooms!</div>;
  }

  return (
    <div className="booking-history">
      <div className="reservations-list">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="reservation-card">
            <div className="reservation-header">
              <h3>Room {reservation.room?.room_number}</h3>
              <span className="status-badge" data-status={reservation.status}>
                {reservation.status}
              </span>
            </div>
            <div className="reservation-details">
              <div className="detail-group">
                <span className="label">Check-in:</span>
                <span className="value">{new Date(reservation.check_in_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-group">
                <span className="label">Check-out:</span>
                <span className="value">{new Date(reservation.check_out_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-group">
                <span className="label">Room Type:</span>
                <span className="value">{reservation.room?.room_type?.name || 'Standard'}</span>
              </div>
              <div className="detail-group">
                <span className="label">Price per Night:</span>
                <span className="value">${reservation.room?.price_per_night}</span>
              </div>
            </div>
            {reservation.special_requests && (
              <div className="special-requests">
                <strong>Special Requests:</strong>
                <p>{reservation.special_requests}</p>
              </div>
            )}
            {reservation.status === 'pending' && (
              <button
                onClick={() => handleCancel(reservation.id)}
                className="btn btn-secondary"
              >
                Cancel Reservation
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
