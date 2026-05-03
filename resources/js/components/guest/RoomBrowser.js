import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import RoomCard from './RoomCard';
import BookingModal from './BookingModal';

export default function RoomBrowser({ showHero = true }) {
  const formatLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
  };

  const todayDate = new Date();
  const tomorrowDate = addDays(todayDate, 1);

  const Icon = ({ type }) => {
    const icons = {
      hotel: <path d="M3 20V10l9-7 9 7v10M7 20v-6h10v6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />,
      calendar: <><rect x="4" y="5" width="16" height="15" rx="2" strokeWidth="1.8" /><path d="M8 3v4M16 3v4M4 10h16" strokeWidth="1.8" strokeLinecap="round" /></>,
      warning: <><circle cx="12" cy="12" r="9" strokeWidth="1.8" /><path d="M12 8v5M12 16h.01" strokeWidth="1.8" strokeLinecap="round" /></>,
    };

    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        {icons[type]}
      </svg>
    );
  };

  const { token } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [filters, setFilters] = useState({
    checkInDate: formatLocalDate(todayDate),
    checkOutDate: formatLocalDate(tomorrowDate),
    roomType: '',
  });

  useEffect(() => {
    fetchRooms();
  }, [token, filters]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      let url = '/api/rooms';
      const params = new URLSearchParams();

      params.append('check_in', filters.checkInDate);
      params.append('check_out', filters.checkOutDate);
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

  const handleRoomSelect = (room, checkInDate = null, checkOutDate = null) => {
    setSelectedRoom(room);
    // If dates are provided (from calendar), use them; otherwise use filter dates
    if (checkInDate && checkOutDate) {
      setFilters((prev) => ({ ...prev, checkInDate, checkOutDate }));
    }
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedRoom(null);
    fetchRooms();
  };

  const today = formatLocalDate(todayDate);

  return (
    <div className="room-browser">
      {/* Hero Section */}
      {showHero && (
        <div className="hero-section">
          <h2 className="section-title">
            <span className="title-icon"><Icon type="hotel" /></span>
            Find Your Perfect Room
          </h2>
          <p>Browse currently available rooms and narrow them down by type from Single to Family.</p>
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
              <option value="2">Standard</option>
              <option value="3">Deluxe</option>
              <option value="4">Suite</option>
              <option value="5">Family</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Display */}
      <div className="rooms-display">
        {isLoading ? (
          <div className="loading">Finding available rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="empty-state">
            <p className="empty-title"><span className="title-icon"><Icon type="warning" /></span>No rooms available</p>
            <p>Try different dates or room type filters.</p>
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
