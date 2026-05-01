import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import RoomCard from './RoomCard';
import BookingModal from './BookingModal';

export default function RoomBrowser() {
  const { token } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchAvailableRooms();
  }, [token]);

  const fetchAvailableRooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/guest/available-rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRooms(data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedRoom(null);
    fetchAvailableRooms();
  };

  return (
    <div className="room-browser">
      {isLoading ? (
        <div className="loading">Loading rooms...</div>
      ) : rooms.length === 0 ? (
        <div className="empty-state">No rooms available</div>
      ) : (
        <div className="rooms-grid">
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              room={room}
              onBook={() => handleRoomSelect(room)}
            />
          ))}
        </div>
      )}

      {showBookingModal && selectedRoom && (
        <BookingModal
          room={selectedRoom}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
