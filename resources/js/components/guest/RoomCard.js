import React from 'react';

export default function RoomCard({ room, onBook }) {
  const pricePerNight = room.room_type?.price_per_night || room.price_per_night || 0;
  const roomTypeName = room.room_type?.name || 'Standard';
  const capacity = room.room_type?.capacity || 1;
  const status = room.room_status?.status_name || 'Available';

  return (
    <div className="room-card">
      <div className="room-card-header">
        <div className="room-info">
          <h3>Room {room.room_number}</h3>
          <span className="room-type">{roomTypeName}</span>
        </div>
        <span className={`status-badge status-${status.toLowerCase()}`}>
          {status}
        </span>
      </div>

      <div className="room-card-details">
        <div className="detail-item">
          <span className="icon">👥</span>
          <span className="text">
            Up to {capacity} {capacity === 1 ? 'guest' : 'guests'}
          </span>
        </div>
        <div className="detail-item">
          <span className="icon">💰</span>
          <span className="text">
            ${pricePerNight}/night
          </span>
        </div>
      </div>

      {room.room_type?.description && (
        <div className="room-description">
          <p>{room.room_type.description}</p>
        </div>
      )}

      {room.amenities && (
        <div className="room-amenities">
          <p className="amenities-label">Amenities:</p>
          <div className="amenities-list">
            {Array.isArray(room.amenities)
              ? room.amenities.map((amenity, idx) => (
                  <span key={idx} className="amenity-tag">
                    {amenity}
                  </span>
                ))
              : null}
          </div>
        </div>
      )}

      <button
        onClick={onBook}
        disabled={status !== 'Available'}
        className="btn btn-primary btn-book"
      >
        {status === 'Available' ? 'Book Now' : `${status} - Unavailable`}
      </button>
    </div>
  );
}
