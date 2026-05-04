import React, { useState } from 'react';
import RoomAvailabilityCalendar from './RoomAvailabilityCalendar';

// Status configuration
const STATUS_CONFIG = {
  'available': { color: '#10b981', textColor: '#065f46', label: 'Available' },
  'vacant': { color: '#10b981', textColor: '#065f46', label: 'Available' },
  'occupied': { color: '#ef4444', textColor: '#7f1d1d', label: 'Occupied' },
  'unavailable': { color: '#ef4444', textColor: '#7f1d1d', label: 'Unavailable' },
  'maintenance': { color: '#f59e0b', textColor: '#92400e', label: 'Maintenance' },
  'reserved': { color: '#f59e0b', textColor: '#92400e', label: 'Reserved' },
};

const DEFAULT_STATUS_CONFIG = { color: '#f59e0b', textColor: '#92400e', label: 'Unknown' };

// SVG Icons
const GUEST_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" />
    <path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6" />
  </svg>
);

const PRICE_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12h8" />
    <path d="M12 8v8" />
  </svg>
);

export default function RoomCard({ room, onBook, onShowCalendar }) {
  const [showCalendar, setShowCalendar] = useState(false);

  // Data extraction with fallbacks
  const pricePerNight = parseFloat(room.room_type?.price_per_night || room.price_per_night || 0);
  const roomTypeName = room.room_type?.name || 'Standard';
  const capacity = room.room_type?.capacity || 1;
  const floor = room.floor ?? null;
  const status = room.availability_status || room.room_status?.status_name || room.status || 'Available';

  // Normalize amenities (DB stores as JSON string or parsed array)
  let amenities = room.amenities || [];
  if (typeof amenities === 'string') {
    try { amenities = JSON.parse(amenities); } catch { amenities = []; }
  }
  if (!Array.isArray(amenities)) { amenities = []; }

  // Normalized status key for config lookup
  const statusKey = String(status).toLowerCase().trim().replace(/\s+/g, '-');
  const statusConfig = STATUS_CONFIG[statusKey] || DEFAULT_STATUS_CONFIG;
  const isAvailable = room.is_available_for_booking ?? (statusKey === 'available' || statusKey === 'vacant');
  const isOccupied = statusKey === 'occupied';
  const isReserved = statusKey === 'reserved';

  // Format price with 2 decimal places
  const formattedPrice = `$${pricePerNight.toFixed(2)}`;

  const handleSelectDates = (checkInDate, checkOutDate) => {
    setShowCalendar(false);
    // Call onBook with selected dates
    onBook(checkInDate, checkOutDate);
  };

  const handleBookClick = () => {
    if (isAvailable) {
      // For available rooms, book immediately with default dates
      onBook();
    } else {
      // For unavailable rooms, prefer delegating calendar showing to parent
      if (typeof onShowCalendar === 'function') {
        onShowCalendar(room);
      } else {
        // fallback to local modal when parent doesn't provide a handler
        setShowCalendar(true);
      }
    }
  };

  return (
    <div className={`room-card ${!isAvailable ? 'room-card--locked' : ''} ${isOccupied ? 'room-card--occupied' : ''} ${isReserved ? 'room-card--reserved' : ''}`}>
      <div className="room-card-header">
        <div className="room-info">
          <h3>Room {room.room_number}</h3>
          <span className="room-type">{roomTypeName}</span>
        </div>
        <span className={`status-badge status-${statusKey}`} title={`Status: ${statusConfig.label}`}>
          <span className="dot" aria-hidden="true" />
          <span className="label">{statusConfig.label}</span>
        </span>
      </div>

      <div className="room-card-details">
        <div className="detail-item">
          <span className="icon" aria-hidden="true">
            {GUEST_ICON}
          </span>
          <span className="text">Up to {capacity} {capacity === 1 ? 'guest' : 'guests'}</span>
        </div>
        {floor !== null && (
          <div className="detail-item">
            <span className="icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M5 21V7l8-4 8 4v14M9 21v-6h6v6" />
              </svg>
            </span>
            <span className="text">Floor {floor}</span>
          </div>
        )}
        <div className="detail-item">
          <span className="icon" aria-hidden="true">
            {PRICE_ICON}
          </span>
          <span className="text">{formattedPrice}/night</span>
        </div>
      </div>

      {room.room_type?.description && (
        <div className="room-description">
          <p>{room.room_type.description}</p>
        </div>
      )}

      {amenities.length > 0 && (
        <div className="room-amenities">
          <p className="amenities-label">Amenities</p>
          <div className="amenities-list">
            {amenities.map((amenity, idx) => (
              <span key={`${amenity}-${idx}`} className="amenity-tag">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleBookClick}
        className={`btn btn-primary btn-book ${isAvailable ? 'btn-available' : 'btn-disabled-available'}`}
        aria-label={`Book Room ${room.room_number} (${roomTypeName}) - ${isAvailable ? 'Available' : statusConfig.label}`}
      >
        {isAvailable ? 'Book Now' : `${statusConfig.label} - See Availability`}
      </button>

      {showCalendar && !onShowCalendar && (
        <div className="calendar-modal-overlay">
          <div className="calendar-modal">
            <RoomAvailabilityCalendar
              room={room}
              onSelectDates={handleSelectDates}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
