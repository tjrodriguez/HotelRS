import React, { useState, useContext, useMemo } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../Modal';
import PricingBreakdown from './PricingBreakdown';

export default function BookingModal({ room, checkInDate, checkOutDate, onClose, onSuccess }) {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    checkInDate: checkInDate || '',
    checkOutDate: checkOutDate || '',
    promotionCode: '',
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [promotion, setPromotion] = useState(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  const today = new Date().toISOString().split('T')[0];

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: formData.promotionCode }),
      });

      const data = await response.json();

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

    if (!formData.checkInDate || !formData.checkOutDate) {
      setError('Please select both check-in and check-out dates');
      return;
    }

    if (nights < 1) {
      setError('Check-out date must be after check-in date');
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
      };

      if (formData.promotionCode) {
        payload.promotion_code = formData.promotionCode;
      }

      if (formData.specialRequests) {
        payload.special_requests = formData.specialRequests;
      }

      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 422 && data.errors) {
          setFieldErrors(data.errors);
          setError('Please fix the errors below');
        } else {
          setError(data.message || 'Booking failed');
        }
        return;
      }

      onSuccess();
    } catch (err) {
      setError(err.message || 'An error occurred during booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={`Book Room ${room.room_number}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="booking-form">
        {error && <div className="form-error">{error}</div>}

        <div className="room-summary">
          <div className="summary-item">
            <span className="label">Room Type:</span>
            <span className="value">{room.room_type?.name || 'Standard'}</span>
          </div>
          <div className="summary-item">
            <span className="label">Price per Night:</span>
            <span className="value price">${room.room_type?.price_per_night || room.price_per_night || 0}</span>
          </div>
          {room.room_type?.capacity && (
            <div className="summary-item">
              <span className="label">Capacity:</span>
              <span className="value">{room.room_type.capacity} {room.room_type.capacity === 1 ? 'guest' : 'guests'}</span>
            </div>
          )}
        </div>

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
            className={fieldErrors.check_in_date ? 'field-error' : ''}
          />
          {fieldErrors.check_in_date && (
            <span className="error-text">{fieldErrors.check_in_date}</span>
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
            className={fieldErrors.check_out_date ? 'field-error' : ''}
          />
          {fieldErrors.check_out_date && (
            <span className="error-text">{fieldErrors.check_out_date}</span>
          )}
        </div>

        {nights > 0 && (
          <PricingBreakdown
            nights={nights}
            basePrice={pricing.basePrice}
            discountAmount={pricing.discountAmount}
            totalPrice={pricing.totalPrice}
            promotionCode={promotion?.code}
          />
        )}

        <div className="form-group promotion-group">
          <label htmlFor="promotionCode">Promotion Code <span style={{fontSize: '12px', color: '#6b7280'}}>(Optional)</span></label>
          <div className="promotion-input-wrapper">
            <input
              type="text"
              id="promotionCode"
              name="promotionCode"
              value={formData.promotionCode}
              onChange={handleChange}
              placeholder="Enter code (e.g., SUMMER2026)"
              disabled={isSubmitting || isValidatingPromo}
              className={fieldErrors.promotionCode ? 'field-error' : ''}
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
                  <span style={{display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite', marginRight: '4px'}}></span>
                  Validating
                </>
              ) : (
                'Validate'
              )}
            </button>
          </div>
          {fieldErrors.promotionCode && (
            <span className="error-text">{fieldErrors.promotionCode}</span>
          )}
          {promotion && (
            <span className="success-text">Promotion applied: {promotion.description} ({promotion.discount_percentage ? `${promotion.discount_percentage}% off` : `$${promotion.discount_amount} off`})</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="specialRequests">Special Requests (Optional)</label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requests?"
            rows="3"
            disabled={isSubmitting}
          />
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
                <span style={{display: 'inline-block', width: '14px', height: '14px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.8s linear infinite', marginRight: '6px'}}></span>
                Booking in progress...
              </>
            ) : (
              `✓ Confirm Booking — $${pricing.totalPrice}`
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
