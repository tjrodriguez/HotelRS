import React, { useState, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import Modal from '../Modal';

export default function BookingModal({ room, onClose, onSuccess }) {
  const { token } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    checkInDate: '',
    checkOutDate: '',
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.checkInDate || !formData.checkOutDate) {
      setError('Please select both check-in and check-out dates');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/guest/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          room_id: room.id,
          check_in_date: formData.checkInDate,
          check_out_date: formData.checkOutDate,
          special_requests: formData.specialRequests,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Booking failed');
      }

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal title={`Book Room ${room.room_number}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="booking-form">
        {error && <div className="form-error">{error}</div>}

        <div className="room-summary">
          <p><strong>Room Type:</strong> {room.room_type?.name || 'Standard'}</p>
          <p><strong>Price per Night:</strong> ${room.price_per_night}</p>
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
          />
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
          />
        </div>

        <div className="form-group">
          <label htmlFor="specialRequests">Special Requests</label>
          <textarea
            id="specialRequests"
            name="specialRequests"
            value={formData.specialRequests}
            onChange={handleChange}
            placeholder="Any special requests?"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onClose} className="btn btn-secondary" disabled={isSubmitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
