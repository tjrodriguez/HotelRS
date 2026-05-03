import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';

const CALENDAR_ICON = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

const ARROW_LEFT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 19l-7-7 7-7" />
  </svg>
);

const ARROW_RIGHT = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 5l7 7-7 7" />
  </svg>
);

export default function RoomAvailabilityCalendar({ room, onSelectDates, onClose }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCheckIn, setSelectedCheckIn] = useState(null);
  const [selectedCheckOut, setSelectedCheckOut] = useState(null);
  const [hoveredDate, setHoveredDate] = useState(null);

  // Fetch room reservations
  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.get(`/rooms/${room.id}/reservations`);
        setReservations(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error('Error fetching reservations:', error);
        setReservations([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (room?.id) {
      fetchReservations();
    }
  }, [room?.id]);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const dateToString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isDateInRange = (checkDate, startDate, endDate) => {
    const check = new Date(`${checkDate}T00:00:00`);
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    return check >= start && check < end;
  };

  const getDateStatus = (date) => {
    const dateStr = dateToString(date);
    for (const res of reservations) {
      if (res.status === 'cancelled') continue;
      if (isDateInRange(dateStr, res.check_in_date, res.check_out_date)) {
        return res.status === 'confirmed' ? 'occupied' : 'reserved';
      }
    }
    return null;
  };

  const isDateBooked = (date) => {
    const dateStr = dateToString(date);
    return reservations.some((res) => {
      if (res.status === 'cancelled') return false;
      return isDateInRange(dateStr, res.check_in_date, res.check_out_date);
    });
  };

  const isDateAvailable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return false;
    return !isDateBooked(date);
  };

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 12, 0, 0);
    const clickedDateStr = dateToString(clickedDate);

    // Booked dates cannot be selected
    if (isDateBooked(clickedDate)) {
      return;
    }

    // If no check-in selected, set it
    if (!selectedCheckIn) {
      setSelectedCheckIn(clickedDateStr);
      setSelectedCheckOut(null);
      return;
    }

    // If check-in is selected but check-out is not
    if (selectedCheckIn && !selectedCheckOut) {
      if (clickedDateStr > selectedCheckIn) {
        setSelectedCheckOut(clickedDateStr);
      } else if (clickedDateStr < selectedCheckIn) {
        // User clicked an earlier date, treat it as new check-in
        setSelectedCheckIn(clickedDateStr);
        setSelectedCheckOut(null);
      }
      return;
    }

    // Both are selected, start over
    setSelectedCheckIn(clickedDateStr);
    setSelectedCheckOut(null);
  };

  const handleConfirmDates = () => {
    if (selectedCheckIn && selectedCheckOut) {
      onSelectDates(selectedCheckIn, selectedCheckOut);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day);
  }

  const isDateSelected = (day) => {
    if (!day) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = dateToString(date);
    return dateStr === selectedCheckIn || dateStr === selectedCheckOut;
  };

  const isDateInSelection = (day) => {
    if (!day || !selectedCheckIn || !selectedCheckOut) return false;
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateStr = dateToString(date);
    const checkIn = new Date(`${selectedCheckIn}T00:00:00`);
    const checkOut = new Date(`${selectedCheckOut}T00:00:00`);
    const current = new Date(`${dateStr}T00:00:00`);
    return current > checkIn && current < checkOut;
  };

  return (
    <div className="availability-calendar">
      <div className="calendar-header">
        <h3>Room {room.room_number} — Select Available Dates</h3>
        <button type="button" onClick={onClose} className="close-btn" aria-label="Close calendar">
          ✕
        </button>
      </div>

      {isLoading ? (
        <div className="calendar-loading">Loading availability...</div>
      ) : (
        <div className="calendar-content">
          <div className="calendar-main">
            <div className="month-navigation">
              <button type="button" onClick={previousMonth} className="nav-btn" aria-label="Previous month">
                {ARROW_LEFT}
              </button>
              <span className="month-label">{monthName}</span>
              <button type="button" onClick={nextMonth} className="nav-btn" aria-label="Next month">
                {ARROW_RIGHT}
              </button>
            </div>

            <div className="calendar-grid">
              <div className="weekday-header">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="weekday">
                    {day}
                  </div>
                ))}
              </div>

              <div className="calendar-days">
                {days.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="calendar-day empty" />;
                  }

                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const dateStatus = getDateStatus(date);
                  const booked = isDateBooked(date);
                  const available = isDateAvailable(date);
                  const selected = isDateSelected(day);
                  const inSelection = isDateInSelection(day);
                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  let statusClass = '';
                  let titleText = '';
                  if (dateStatus === 'occupied') {
                    statusClass = 'occupied';
                    titleText = 'Room is occupied';
                  } else if (dateStatus === 'reserved') {
                    statusClass = 'reserved';
                    titleText = 'Room is reserved (awaiting confirmation)';
                  } else if (booked) {
                    titleText = 'This date is booked';
                  } else if (available) {
                    titleText = 'Click to select';
                  } else {
                    titleText = 'Date has passed';
                  }

                  return (
                    <button
                      key={`day-${day}`}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      disabled={booked || !available}
                      className={`calendar-day ${statusClass || (booked ? 'booked' : '')} ${available && !statusClass ? 'available' : ''} ${selected ? 'selected' : ''} ${inSelection ? 'in-selection' : ''} ${isToday && !statusClass ? 'today' : ''}`}
                      onMouseEnter={() => selectedCheckIn && !selectedCheckOut && setHoveredDate(dateToString(date))}
                      onMouseLeave={() => setHoveredDate(null)}
                      title={titleText}
                    >
                      <div className="day-number">{day}</div>
                      {statusClass && <div className="day-status">{statusClass === 'occupied' ? '🏨' : '📅'}</div>}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="calendar-legend">
              <div className="legend-item">
                <span className="legend-color available" />
                <span>Available</span>
              </div>
              <div className="legend-item">
                <span className="legend-color reserved" />
                <span>Reserved 📅</span>
              </div>
              <div className="legend-item">
                <span className="legend-color occupied" />
                <span>Occupied 🏨</span>
              </div>
              <div className="legend-item">
                <span className="legend-color selected" />
                <span>Selected</span>
              </div>
            </div>
          </div>

          <div className="calendar-sidebar">
            <div className="selection-info">
              <h4>Your Selection</h4>

              {!selectedCheckIn ? (
                <p className="info-text">Click a date to select check-in</p>
              ) : !selectedCheckOut ? (
                <div className="selection-details">
                  <div className="date-item">
                    <span className="label">Check-in:</span>
                    <span className="date">{new Date(`${selectedCheckIn}T00:00:00`).toLocaleDateString()}</span>
                  </div>
                  <p className="info-text">Click another date for check-out</p>
                </div>
              ) : (
                <div className="selection-details">
                  <div className="date-item">
                    <span className="label">Check-in:</span>
                    <span className="date">{new Date(`${selectedCheckIn}T00:00:00`).toLocaleDateString()}</span>
                  </div>
                  <div className="date-item">
                    <span className="label">Check-out:</span>
                    <span className="date">{new Date(`${selectedCheckOut}T00:00:00`).toLocaleDateString()}</span>
                  </div>
                  <div className="nights-count">
                    {Math.ceil((new Date(`${selectedCheckOut}T00:00:00`) - new Date(`${selectedCheckIn}T00:00:00`)) / (1000 * 60 * 60 * 24))} nights
                  </div>
                  <button
                    type="button"
                    onClick={handleConfirmDates}
                    className="btn btn-primary btn-confirm-dates"
                    title="Proceed to booking form"
                  >
                    Continue to Booking
                  </button>
                </div>
              )}
            </div>

            <div className="room-info-sidebar">
              <h4>Room Info</h4>
              <div className="info-item">
                <span className="label">Room Type:</span>
                <span className="value">{room.room_type?.name || 'Standard'}</span>
              </div>
              <div className="info-item">
                <span className="label">Capacity:</span>
                <span className="value">Up to {room.room_type?.capacity || 1} guests</span>
              </div>
              <div className="info-item">
                <span className="label">Price:</span>
                <span className="value">${parseFloat(room.room_type?.price_per_night || 0).toFixed(2)}/night</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
