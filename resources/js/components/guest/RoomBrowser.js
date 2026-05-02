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
  const [filters, setFilters] = useState({
    checkInDate: '',
    checkOutDate: '',
    roomType: '',
  });

  useEffect(() => {
    // Only fetch if both dates are selected
    if (filters.checkInDate && filters.checkOutDate) {
      fetchRooms();
    } else {
      setRooms([]);
    }
  }, [token, filters]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      let url = '/api/rooms';
      const params = new URLSearchParams();

      if (filters.checkInDate) params.append('check_in', filters.checkInDate);
      if (filters.checkOutDate) params.append('check_out', filters.checkOutDate);
      if (filters.roomType) params.append('room_type_id', filters.roomType);

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRooms(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setRooms([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedRoom(null);
    fetchRooms();
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="room-browser">
      {/* Hero Section */}
      {!filters.checkInDate && !filters.checkOutDate && (
        <div className="hero-section">
          <h2>🏨 Find Your Perfect Room</h2>
          <p>Select your check-in and check-out dates to explore our available rooms and start your booking</p>
        </div>
      )}

      {/* Search Panel */}
      <div className="search-panel">
        <h3>Search Rooms</h3>
        <div className="search-filters">
          <div className="filter-group">
            <label htmlFor="checkInDate">Check-in Date</label>
            <input
              type="date"
              id="checkInDate"
              name="checkInDate"
              value={filters.checkInDate}
              onChange={handleFilterChange}
              min={today}
              aria-label="Select check-in date"
              title="Select your check-in date (must be today or later)"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="checkOutDate">Check-out Date</label>
            <input
              type="date"
              id="checkOutDate"
              name="checkOutDate"
              value={filters.checkOutDate}
              onChange={handleFilterChange}
              min={filters.checkInDate || today}
              disabled={!filters.checkInDate}
              aria-label="Select check-out date"
              title={filters.checkInDate ? "Select your check-out date (must be after check-in)" : "Please select check-in date first"}
            />
          </div>

          <div className="filter-group">
            <label htmlFor="roomType">Room Type</label>
            <select
              id="roomType"
              name="roomType"
              value={filters.roomType}
              onChange={handleFilterChange}
              aria-label="Filter by room type"
            >
              <option value="">All Types</option>
              <option value="1">Single</option>
              <option value="2">Double</option>
              <option value="3">Deluxe</option>
              <option value="4">Suite</option>
              <option value="5">Family</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="rooms-display">
        {!filters.checkInDate || !filters.checkOutDate ? (
          <div className="empty-state">
            <p>📅 Select dates to view rooms</p>
            <p>Choose your check-in and check-out dates above to see available rooms</p>
          </div>
        ) : isLoading ? (
          <div className="loading">Finding available rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <p>🚫 No rooms available</p>
            <p>Try different dates or room type filters</p>
          </div>
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
      </div>

      {showBookingModal && selectedRoom && (
        <BookingModal
          room={selectedRoom}
          checkInDate={filters.checkInDate}
          checkOutDate={filters.checkOutDate}
          onClose={() => setShowBookingModal(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
