import React from 'react';

export default function RoomCard({ room, onBook }) {
  return (
    <div className="room-card">
      <div className="room-header">
        <h3>Room {room.room_number}</h3>
        <span className="room-type">{room.room_type?.name || 'Standard'}</span>
      </div>
      <div className="room-details">
        <div className="detail-item">
          <span className="label">Status:</span>
          <span className="value">{room.room_status?.status_name || 'Available'}</span>
        </div>
        <div className="detail-item">
          <span className="label">Price per Night:</span>
          <span className="value price">${room.price_per_night}</span>
        </div>
      </div>
      <div className="room-description">
        <p>{room.room_type?.description || 'A comfortable room for your stay'}</p>
      </div>
      <button onClick={onBook} className="btn btn-primary btn-book">
        Book Now
      </button>
    </div>
  );
}
