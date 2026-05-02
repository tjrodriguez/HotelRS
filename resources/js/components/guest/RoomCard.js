import React from 'react';

// Status configuration
const STATUS_CONFIG = {
  'available': { color: '#10b981', textColor: '#065f46', label: 'Available' },
  'vacant': { color: '#10b981', textColor: '#065f46', label: 'Available' },
  'occupied': { color: '#ef4444', textColor: '#7f1d1d', label: 'Occupied' },
  'unavailable': { color: '#ef4444', textColor: '#7f1d1d', label: 'Unavailable' },
  'maintenance': { color: '#f59e0b', textColor: '#92400e', label: 'Maintenance' },
  'reserved': { color: '#8b5cf6', textColor: '#5b21b6', label: 'Reserved' },
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

export default function RoomCard({ room, onBook }) {
  // Data extraction with fallbacks
  const pricePerNight = parseFloat(room.room_type?.price_per_night || room.price_per_night || 0);
  const roomTypeName = room.room_type?.name || 'Standard';
  const capacity = room.room_type?.capacity || 1;
  const status = room.room_status?.status_name || 'Available';
  
  // Normalized status key for config lookup
  const statusKey = String(status).toLowerCase().trim().replace(/\s+/g, '-');
  const statusConfig = STATUS_CONFIG[statusKey] || DEFAULT_STATUS_CONFIG;
  const isAvailable = statusKey === 'available' || statusKey === 'vacant';
  
  // Format price with 2 decimal places
  const formattedPrice = `$${pricePerNight.toFixed(2)}`;

  return (
    <div className="room-card">
      <div className="room-card-header">
        <div className="room-info">
          <h3>Room {room.room_number}</h3>
          <span className="room-type">{roomTypeName}</span>
        </div>
        <span className={`status-badge status-${statusKey}`} title={`Status: ${statusConfig.label}`}>
          <span
            className="dot"
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: statusConfig.color,
              boxShadow: `0 0 0 2px rgba(255,255,255,0.9), inset 0 0 0 1px ${statusConfig.color}20`,
              flexShrink: 0,
            }}
          />
          <span 
            className="label" 
            style={{ 
              color: statusConfig.textColor,
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            {statusConfig.label}
          </span>
        </span>
      </div>

      <div className="room-card-details">
        <div className="detail-item">
          <span className="icon" aria-hidden="true">
            {GUEST_ICON}
          </span>
          <span className="text">Up to {capacity} {capacity === 1 ? 'guest' : 'guests'}</span>
        </div>
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

      {room.amenities && Array.isArray(room.amenities) && room.amenities.length > 0 && (
        <div className="room-amenities">
          <p className="amenities-label">Amenities</p>
          <div className="amenities-list">
            {room.amenities.map((amenity, idx) => (
              <span key={`${amenity}-${idx}`} className="amenity-tag">
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onBook}
        disabled={!isAvailable}
        className={`btn btn-primary btn-book ${isAvailable ? 'btn-available' : 'btn-disabled'}`}
        aria-label={`Book Room ${room.room_number} (${roomTypeName}) - ${isAvailable ? 'Available' : statusConfig.label}`}
      >
        {isAvailable ? 'Book Now' : `${statusConfig.label} - Unavailable`}
      </button>
    </div>
  );
}
