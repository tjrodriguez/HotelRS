import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
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
  }, []);

  const bookingStyles = (
    <style>{`
      /* My Bookings compact header + spacing overrides (scoped) */
      .history-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 8px;padding-bottom:8px;border-bottom:1px solid rgba(15,23,42,.06)}
      .section-title{font-size:18px;margin:0;display:flex;align-items:center;gap:8px;color:#0f172a;letter-spacing:-.2px}
      .history-subtitle{display:block;margin:0;font-size:12px;color:#64748b}
      .history-summary{display:flex;gap:8px;margin:0;align-items:center}
      .summary-pill{background:#fff;border:1px solid #e8edf2;border-radius:12px;padding:7px 11px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:90px;box-shadow:0 2px 8px rgba(15,23,42,.04)}
      .summary-pill.accent{background:linear-gradient(135deg,#f0f9ff,#ecfeff);border-color:rgba(20,184,166,.22)}
      .summary-number{font-size:16px;font-weight:800;color:var(--primary)}
      .summary-label{font-size:11px;color:var(--text-muted)}
      .reservations-list{display:flex;flex-direction:column;gap:10px}
      .reservation-card{display:block!important;min-height:auto!important;height:auto!important;border:1px solid #e5e7eb;border-radius:12px;padding:10px 12px;background:linear-gradient(180deg,#fff,#fcfdff)}
      .reservation-card-header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:8px}
      .reservation-info h3{margin:0 0 4px;font-size:16px}
      .reservation-id{color:var(--text-muted);font-size:13px;margin:0}
      .reservation-details{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-top:0!important;margin-bottom:8px}
      .detail-group .label{color:var(--text-muted);display:block;font-size:12px;margin-bottom:6px}
      .detail-group .value{color:var(--dark);font-size:14px;font-weight:600}
      .pricing-breakdown{margin:6px 0!important;padding:10px!important;border-radius:10px!important}
      .pricing-row{padding:6px 0!important}
      .special-requests{margin-top:8px;padding-top:8px;border-top:1px dashed var(--border)}
      .status-badge{border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;background:#f8fafc;border:1px solid #e2e8f0;color:#334155}
      .status-pending{background:#fffbeb;border-color:#fde68a;color:#92400e}
      .status-confirmed{background:#ecfdf5;border-color:#a7f3d0;color:#065f46}
      .status-cancelled{background:#fef2f2;border-color:#fecaca;color:#991b1b}
      .reservation-actions{margin-top:6px;display:flex;justify-content:flex-end;gap:8px}
      @media(max-width:640px){
        .history-header{align-items:flex-start}
        .history-summary{flex-direction:column;align-items:flex-start}
        .reservation-details{grid-template-columns:1fr}
        .reservation-card{padding:10px}
      }
    `}</style>
  );

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
        {bookingStyles}
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
        {bookingStyles}
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
        {bookingStyles}
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
      {bookingStyles}
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
