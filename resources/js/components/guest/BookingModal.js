import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../Modal';
import PricingBreakdown from './PricingBreakdown';

// Icons
const BED_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10h18v8H3z" />
    <path d="M3 10V6h18v4" />
  </svg>
);

const USERS_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
    <path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6" />
  </svg>
);

const PRICE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

const CHECK_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ALERT_ICON = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4M12 16h.01" fill="white" />
  </svg>
);

const readResponseData = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const bodyText = await response.text();

  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(bodyText);
    } catch (error) {
      return {
        message: 'The server returned invalid JSON.',
        raw: bodyText,
      };
    }
  }

  return {
    message: bodyText || 'Unexpected server response.',
    raw: bodyText,
  };
};

const getDateString = (date) => date.toISOString().split('T')[0];

const getTomorrowDateString = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getDateString(tomorrow);
};

const getDateStringWithOffset = (baseDateString, offsetDays) => {
  const date = new Date(`${baseDateString}T00:00:00`);
  date.setDate(date.getDate() + offsetDays);
  return getDateString(date);
};

const normalizeFutureDate = (value, fallback) => {
  if (!value) {
    return fallback;
  }

  const dateValue = new Date(`${value}T00:00:00`);
  const minimumDate = new Date(`${fallback}T00:00:00`);

  if (Number.isNaN(dateValue.getTime()) || dateValue <= minimumDate) {
    return fallback;
  }

  return value;
};

export default function BookingModal({ room, checkInDate, checkOutDate, onClose, onSuccess }) {
  const { token } = useContext(AuthContext);
  const tomorrow = getTomorrowDateString();
  const normalizedCheckInDate = normalizeFutureDate(checkInDate, tomorrow);
  const normalizedCheckOutDate = normalizeFutureDate(checkOutDate, getDateStringWithOffset(normalizedCheckInDate, 1));
  const [formData, setFormData] = useState({
    checkInDate: normalizedCheckInDate,
    checkOutDate: normalizedCheckOutDate,
    numberOfGuests: room.room_type?.capacity || 1,
    promotionCode: '',
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [promotion, setPromotion] = useState(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const today = tomorrow;

  const nights = useMemo(() => {
    if (!formData.checkInDate || !formData.checkOutDate) return 0;
    const start = new Date(formData.checkInDate);
    const end = new Date(formData.checkOutDate);
    return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
  }, [formData.checkInDate, formData.checkOutDate]);

  const pricing = useMemo(() => {
    const basePrice = (room.room_type?.price_per_night || room.price_per_night || 0) * nights;
    let discountAmount = 0;

    if (promotion) {
      if (promotion.discount_percentage) {
        discountAmount = basePrice * (promotion.discount_percentage / 100);
      } else if (promotion.discount_amount) {
        discountAmount = promotion.discount_amount;
      }
    }

    const totalPrice = Math.max(0, basePrice - discountAmount);

    return {
      basePrice: parseFloat(basePrice.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      totalPrice: parseFloat(totalPrice.toFixed(2)),
    };
  }, [nights, promotion, room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleValidatePromotion = async () => {
    if (!formData.promotionCode.trim()) {
      setPromotion(null);
      return;
    }

    setIsValidatingPromo(true);
    try {
      const response = await fetch('/api/promotions/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: formData.promotionCode }),
      });

      const data = await readResponseData(response);

      if (response.ok) {
        setPromotion(data);
        setFieldErrors((prev) => {
          const updated = { ...prev };
          delete updated.promotionCode;
          return updated;
        });
      } else {
        setPromotion(null);
        setFieldErrors((prev) => ({
          ...prev,
          promotionCode: data.message || 'Invalid promotion code',
        }));
      }
    } catch (err) {
      setPromotion(null);
      setFieldErrors((prev) => ({
        ...prev,
        promotionCode: 'Error validating promotion code',
      }));
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Nights:', nights);

    // Validation
    if (!formData.checkInDate || !formData.checkOutDate) {
      const msg = 'Please select both check-in and check-out dates';
      setError(msg);
      console.error(msg);
      return;
    }

    if (nights < 1) {
      const msg = 'Check-out date must be after check-in date';
      setError(msg);
      console.error(msg);
      return;
    }

    if (formData.checkInDate <= new Date().toISOString().split('T')[0]) {
      const msg = 'Check-in must be at least tomorrow.';
      setError(msg);
      console.error(msg);
      return;
    }

    if (!room?.id) {
      const msg = 'Room information missing';
      setError(msg);
      console.error(msg);
      return;
    }

    if (!token) {
      const msg = 'Authentication token missing';
      setError(msg);
      console.error(msg);
      return;
    }

    setIsSubmitting(true);
    setError('');
    setFieldErrors({});

    try {
      const payload = {
        room_id: room.id,
        check_in_date: formData.checkInDate,
        check_out_date: formData.checkOutDate,
        number_of_guests: parseInt(formData.numberOfGuests, 10),
      };

      if (formData.promotionCode?.trim()) {
        payload.promotion_code = formData.promotionCode.trim();
      }

      if (formData.specialRequests?.trim()) {
        payload.special_requests = formData.specialRequests.trim();
      }

      console.log('Submitting payload:', payload);

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await readResponseData(response);
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          console.error('Validation errors:', data.errors);
          setFieldErrors(data.errors);
          setError('Please fix the errors below');
        } else if (response.status === 401) {
          setError('Please sign in again before booking.');
        } else if (response.status === 419) {
          setError('Your session expired. Please refresh and try again.');
        } else if (data.message) {
          console.error('API error:', data.message);
          setError(data.message);
        } else {
          console.error('Booking failed with unknown error');
          setError('Booking failed. Please try again.');
        }
        return;
      }

      console.log('Booking successful!');
      onSuccess();
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message || 'An error occurred during booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roomPrice = parseFloat(room.room_type?.price_per_night || room.price_per_night || 0);
  const formattedPrice = `$${roomPrice.toFixed(2)}`;

  return (
    <Modal title={`Book Room ${room.room_number}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="booking-form" noValidate>
        {/* Debug info */}
        <div style={{ display: 'none' }} data-debug={JSON.stringify({ nights, isSubmitting, token: !!token, roomId: room?.id })}>
          Debug
        </div>

        {error && (
          <div className="form-error-banner" role="alert">
            <span className="error-icon">{ALERT_ICON}</span>
            <span className="error-text">{error}</span>
          </div>
        )}

        <div className="booking-section">
          <h3 className="section-title">Room Details</h3>
          <div className="room-summary-grid">
            <div className="summary-card">
              <div className="card-icon bed-icon">{BED_ICON}</div>
              <div className="card-content">
                <span className="card-label">Room Type</span>
                <span className="card-value">{room.room_type?.name || 'Standard'}</span>
              </div>
            </div>
            <div className="summary-card">
              <div className="card-icon price-icon">{PRICE_ICON}</div>
              <div className="card-content">
                <span className="card-label">Price per Night</span>
                <span className="card-value">{formattedPrice}</span>
              </div>
            </div>
            {room.room_type?.capacity && (
              <div className="summary-card">
                <div className="card-icon users-icon">{USERS_ICON}</div>
                <div className="card-content">
                  <span className="card-label">Capacity</span>
                  <span className="card-value">{room.room_type.capacity} {room.room_type.capacity === 1 ? 'guest' : 'guests'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="booking-section">
          <h3 className="section-title">Select Your Dates</h3>
          <div className="dates-grid">
            <div className="form-group">
              <label htmlFor="checkInDate">Check-in Date</label>
              <input
                type="date"
                id="checkInDate"
                name="checkInDate"
                value={formData.checkInDate}
                onChange={handleChange}
                min={today}
                required
                disabled={isSubmitting}
                className={`date-input ${fieldErrors.check_in_date ? 'field-error' : ''}`}
              />
              {fieldErrors.check_in_date && (
                <span className="field-error-text">{fieldErrors.check_in_date}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="checkOutDate">Check-out Date</label>
              <input
                type="date"
                id="checkOutDate"
                name="checkOutDate"
                value={formData.checkOutDate}
                onChange={handleChange}
                min={formData.checkInDate || today}
                required
                disabled={isSubmitting}
                className={`date-input ${fieldErrors.check_out_date ? 'field-error' : ''}`}
              />
              {fieldErrors.check_out_date && (
                <span className="field-error-text">{fieldErrors.check_out_date}</span>
              )}
            </div>
          </div>
          {nights > 0 && (
            <div className="nights-display">
              <div className="nights-info">
                <div className="nights-number">{nights}</div>
                <div className="nights-label">{nights === 1 ? 'Night' : 'Nights of Rest'}</div>
              </div>
              <div className="nights-savings">
                {nights >= 7 && <span className="savings-badge">7+ nights special rate</span>}
                {nights >= 14 && <span className="savings-badge highlight">2 weeks - best value</span>}
                {nights >= 3 && nights < 7 && <span className="savings-badge">Mid-stay discount</span>}
              </div>
            </div>
          )}
          {nights === 0 && formData.checkInDate && (
            <div className="field-error-text" style={{marginTop: '8px', display: 'block'}}>
              Please select both check-in and check-out dates
            </div>
          )}

          {formData.checkInDate && !formData.checkOutDate && (
            <div className="quick-nights-selector">
              <div className="quick-label">✨ Suggested stays:</div>
              <div className="quick-buttons">
                {[1, 2, 3, 7, 14].map((daysToAdd) => {
                  const checkInDate = new Date(formData.checkInDate);
                  const checkOutDate = new Date(checkInDate);
                  checkOutDate.setDate(checkOutDate.getDate() + daysToAdd);
                  const checkOutDateStr = checkOutDate.toISOString().split('T')[0];
                  
                  return (
                    <button
                      key={daysToAdd}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, checkOutDate: checkOutDateStr }));
                      }}
                      className="btn-quick-night"
                      disabled={isSubmitting}
                    >
                      <div className="btn-nights">{daysToAdd}</div>
                      <div className="btn-label">{daysToAdd === 1 ? 'night' : 'nights'}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="booking-section">
          <h3 className="section-title">Number of Guests</h3>
          <div className="guests-selector">
            <div className="form-group">
              <label htmlFor="numberOfGuests">How many guests?</label>
              <select
                id="numberOfGuests"
                name="numberOfGuests"
                value={formData.numberOfGuests}
                onChange={handleChange}
                disabled={isSubmitting}
                className="guests-input"
              >
                {[...Array(room.room_type?.capacity || 1)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i === 0 ? 'guest' : 'guests'}
                  </option>
                ))}
              </select>
              {fieldErrors.number_of_guests && (
                <span className="field-error-text">{fieldErrors.number_of_guests}</span>
              )}
            </div>
          </div>
        </div>

        {nights > 0 && (
          <div className="booking-section pricing-section">
            <PricingBreakdown
              nights={nights}
              basePrice={pricing.basePrice}
              discountAmount={pricing.discountAmount}
              totalPrice={pricing.totalPrice}
              promotionCode={promotion?.code}
            />
          </div>
        )}

        <div className="booking-section">
          <h3 className="section-title">Add a Promotion (Optional)</h3>
          <div className="form-group promotion-group">
            <label htmlFor="promotionCode">Promotion Code</label>
            <div className="promotion-input-wrapper">
              <input
                type="text"
                id="promotionCode"
                name="promotionCode"
                value={formData.promotionCode}
                onChange={handleChange}
                placeholder="Enter promo code"
                disabled={isSubmitting || isValidatingPromo}
                className={`promo-input ${fieldErrors.promotionCode ? 'field-error' : ''}`}
                aria-label="Promotion code input"
              />
              <button
                type="button"
                onClick={handleValidatePromotion}
                disabled={isSubmitting || isValidatingPromo || !formData.promotionCode.trim()}
                className="btn-validate"
                title="Click to validate your promotion code"
                aria-label="Validate promotion code"
              >
                {isValidatingPromo ? (
                  <>
                    <span className="spinner"></span>
                    Validating
                  </>
                ) : (
                  'Validate'
                )}
              </button>
            </div>
            {fieldErrors.promotionCode && (
              <span className="field-error-text">{fieldErrors.promotionCode}</span>
            )}
            {promotion && (
              <div className="promo-success" role="status">
                <span className="promo-icon">{CHECK_ICON}</span>
                <span className="promo-text">{promotion.description} ({promotion.discount_percentage ? `${promotion.discount_percentage}% off` : `$${promotion.discount_amount} off`})</span>
              </div>
            )}
          </div>
        </div>

        <div className="booking-section">
          <h3 className="section-title">Special Requests (Optional)</h3>
          <div className="form-group">
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Any special requests? (e.g., high floor, early check-in)"
              rows="3"
              disabled={isSubmitting}
              className="special-requests-input"
            />
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={onClose} 
            className="btn-cancel" 
            disabled={isSubmitting}
            title="Close booking form without reserving"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn-confirm" 
            disabled={isSubmitting || nights < 1}
            title={nights < 1 ? "Please select valid dates" : "Complete your reservation"}
            aria-label={`Confirm booking for $${pricing.totalPrice}`}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              <>
                <span className="confirm-icon">{CHECK_ICON}</span>
                Confirm Booking — ${pricing.totalPrice}
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
