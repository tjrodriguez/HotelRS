import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import DataTable from './DataTable';
import Modal from '../Modal';
import StatusBadge from './StatusBadge';

export default function ReservationsManagement() {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [formData, setFormData] = useState({
    guest_id: '',
    room_id: '',
    check_in_date: '',
    check_out_date: '',
    status: 'pending',
  });
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getReservations();
      const reservationList = Array.isArray(data) ? data : data.data || [];
      setReservations(reservationList);
      setSelectedDate(null);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Build a map of date -> reservations for quick lookup (includes each day in the range)
  const buildDateMap = (items) => {
    const rows = Array.isArray(items) ? items : items?.data || [];
    const map = {};
    rows.forEach((r) => {
      const start = new Date(r.check_in_date);
      const end = new Date(r.check_out_date);
      for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().slice(0, 10);
        map[key] = map[key] || [];
        map[key].push(r);
      }
    });
    return map;
  };

  // Build a map of check-in, check-out, and cancelled dates for highlighting
  const buildCheckInOutDates = (items) => {
    const rows = Array.isArray(items) ? items : items?.data || [];
    const checkIns = {};
    const checkOuts = {};
    const cancelled = {};
    rows.forEach((r) => {
      if (r.status === 'cancelled') {
        const cancelledKey = new Date(r.check_in_date).toISOString().slice(0, 10);
        cancelled[cancelledKey] = (cancelled[cancelledKey] || 0) + 1;
      } else {
        const checkInKey = new Date(r.check_in_date).toISOString().slice(0, 10);
        const checkOutKey = new Date(r.check_out_date).toISOString().slice(0, 10);
        checkIns[checkInKey] = (checkIns[checkInKey] || 0) + 1;
        checkOuts[checkOutKey] = (checkOuts[checkOutKey] || 0) + 1;
      }
    });
    return { checkIns, checkOuts, cancelled };
  };

  const { checkIns, checkOuts, cancelled } = buildCheckInOutDates(reservations);
  const reservationsByDate = buildDateMap(reservations);

  const firstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

  const goMonth = (offset) => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + offset, 1));

  // Generate calendar days for month view (6 rows x 7 columns with padding)
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday
    
    const days = [];
    
    // Add padding from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i)
      });
    }
    
    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      });
    }
    
    // Add padding from next month (6 rows = 42 total cells)
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i)
      });
    }
    
    return days;
  };

  // Check if a date has check-in, check-out, or cancelled reservations
  const hasCheckInOut = (date) => {
    const dateStr = date.toISOString().slice(0, 10);
    return {
      hasCheckIn: !!checkIns[dateStr],
      hasCheckOut: !!checkOuts[dateStr],
      hasCancelled: !!cancelled[dateStr]
    };
  };

  const formatMonthTitle = (d) => d.toLocaleString('default', { month: 'long', year: 'numeric' });

  const formatSelectedDate = (dateStr) => {
    if (!dateStr) return '';
    // dateStr expected in YYYY-MM-DD
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [y, m, day] = parts;
    const mm = m.padStart(2, '0');
    const dd = day.padStart(2, '0');
    const yyyy = y;
    const dateObj = new Date(`${yyyy}-${mm}-${dd}T00:00:00`);
    const weekday = dateObj.toLocaleString('default', { weekday: 'long' });
    const todayKey = new Date().toISOString().slice(0,10);
    const isToday = dateStr === todayKey;
    return `Reservations for ${mm}-${dd}-${yyyy} (${weekday}${isToday ? ' Today' : ''})`;
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setFormData({
      guest_id: reservation.guest_id,
      room_id: reservation.room_id,
      check_in_date: reservation.check_in_date,
      check_out_date: reservation.check_out_date,
      status: reservation.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (reservation) => {
    if (confirm(`Cancel this reservation?`)) {
      try {
        const updatedReservation = await apiClient.put(`/reservations/${reservation.id}/cancel`, {});
        setReservations((previous) => previous.map((r) => (r.id === updatedReservation.id ? updatedReservation : r)));
      } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('Could not cancel this reservation.');
      }
    }
  };

  const handleSave = async () => {
    if (editingReservation) {
      try {
        const updatedReservation = await apiClient.put(`/reservations/${editingReservation.id}`, formData);
        setReservations((previous) => previous.map((r) => (r.id === updatedReservation.id ? updatedReservation : r)));
        setShowModal(false);
        setEditingReservation(null);
      } catch (error) {
        console.error('Error updating reservation:', error);
      }
    }
  };

  const handleAccept = async (reservation) => {
    try {
      const updatedReservation = await apiClient.confirmReservation(reservation.id);
      setReservations((previous) => previous.map((item) => (
        item.id === updatedReservation.id ? updatedReservation : item
      )));
    } catch (error) {
      console.error('Error accepting reservation:', error);
      alert('Could not accept this reservation.');
    }
  };

  const handleDecline = async (reservation) => {
    if (!confirm('Decline this reservation?')) {
      return;
    }

    try {
      const updatedReservation = await apiClient.put(`/reservations/${reservation.id}/decline`, {});
      setReservations((previous) => previous.map((item) => (
        item.id === updatedReservation.id ? updatedReservation : item
      )));
    } catch (error) {
      console.error('Error declining reservation:', error);
      alert('Could not decline this reservation.');
    }
  };

  const handleCheckIn = async (reservation) => {
    try {
      const updatedReservation = await apiClient.checkInReservation(reservation.id);
      setReservations((previous) => previous.map((item) => (
        item.id === updatedReservation.id ? updatedReservation : item
      )));
    } catch (error) {
      console.error('Error checking in:', error);
      alert('Could not check in this reservation.');
    }
  };

  const handleCheckOut = async (reservation) => {
    try {
      const updatedReservation = await apiClient.checkOutReservation(reservation.id);
      setReservations((previous) => previous.map((item) => (
        item.id === updatedReservation.id ? updatedReservation : item
      )));
    } catch (error) {
      console.error('Error checking out:', error);
      alert('Could not check out this reservation.');
    }
  };

  const columns = [
    { key: 'id', label: 'ID', align: 'right' },
    {
      key: 'guest_info',
      label: 'Guest',
      render: (value, row) => `${row.guest?.name || row.guest_name || `Guest #${row.guest_id}`}`
    },
    {
      key: 'room_number',
      label: 'Room',
      render: (value, row) => `Room ${row.room?.room_number || row.room_id}`
    },
    {
      key: 'check_in_date',
      label: 'Check In',
      render: (value) => new Date(value).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
    },
    {
      key: 'check_out_date',
      label: 'Check Out',
      render: (value) => new Date(value).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
    },
    {
      key: 'nights',
      label: 'Nights',
      align: 'right',
      render: (value, row) => {
        const start = new Date(row.check_in_date);
        const end = new Date(row.check_out_date);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff;
      }
    },
    {
      key: 'total_price',
      label: 'Total',
      align: 'right',
      render: (value, row) => {
        const displayedTotal = parseFloat(
          row.calculated_total_price ?? row.total_price ?? 0,
        );

        return `$${displayedTotal.toFixed(2)}`;
      }
    },
    {
      key: 'paid_amount',
      label: 'Paid',
      align: 'right',
      render: (value, row) => `$${parseFloat(row.paid_amount ?? 0).toFixed(2)}`,
    },
    {
      key: 'balance_due',
      label: 'Balance',
      align: 'right',
      render: (value, row) => `$${parseFloat(row.balance_due ?? 0).toFixed(2)}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (value) => <StatusBadge status={value} />,
    },
  ];


  // Chevron icons for navigation
  const ChevronLeft = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );

  const ChevronRight = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date().toISOString().slice(0, 10));
  };

  return (
    <div className="management-container">
      <h2>Reservations Management</h2>
      <div className="reservations-calendar-wrap">
        <div className="calendar">
          <div className="calendar-header">
            <div className="calendar-nav">
              <button className="btn-icon" onClick={() => goMonth(-1)} aria-label="Previous month">
                <ChevronLeft />
              </button>
              <button className="btn-today" onClick={goToToday}>
                <CalendarIcon />
                <span>Today</span>
              </button>
              <button className="btn-icon" onClick={() => goMonth(1)} aria-label="Next month">
                <ChevronRight />
              </button>
            </div>
            <div className="calendar-title">{formatMonthTitle(currentMonth)}</div>
          </div>
          <div className="calendar-grid">
            <div className="calendar-weekday-headers">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday-header">{day}</div>
              ))}
            </div>
            <div className="calendar-days">
              {getCalendarDays().map((day, idx) => {
                const { hasCheckIn, hasCheckOut, hasCancelled } = hasCheckInOut(day.fullDate);
                const isToday = day.isCurrentMonth && day.fullDate.toDateString() === new Date().toDateString();
                const dateStr = day.fullDate.toISOString().slice(0, 10);
                
                let highlightClass = '';
                if (hasCancelled) highlightClass = 'cancelled';
                else if (hasCheckIn && hasCheckOut) highlightClass = 'both-events';
                else if (hasCheckIn) highlightClass = 'checkin';
                else if (hasCheckOut) highlightClass = 'checkout';
                
                return (
                  <div
                    key={idx}
                    className={`calendar-day ${day.isCurrentMonth ? '' : 'other-month'} ${isToday ? 'today' : ''} ${highlightClass}`}
                    onClick={() => day.isCurrentMonth && setSelectedDate(dateStr)}
                  >
                    <div className="day-number">{day.date}</div>
                    {day.isCurrentMonth && (hasCheckIn || hasCheckOut || hasCancelled) && (
                      <div className="check-indicators">
                        {hasCheckIn && <div className="indicator checkin" title="Check-in">↓</div>}
                        {hasCheckOut && <div className="indicator checkout" title="Check-out">↑</div>}
                        {hasCancelled && <div className="indicator cancelled-badge" title="Cancelled">✕</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
          <div className="calendar-legend">
            <h3 className="legend-title">Legend</h3>
            <div className="legend-items">
              <div className="legend-item">
                <div className="legend-indicator checkin">↓</div>
                <span>Check-in</span>
              </div>
              <div className="legend-item">
                <div className="legend-indicator checkout">↑</div>
                <span>Check-out</span>
              </div>
              <div className="legend-item">
                <div className="legend-indicator cancelled">✕</div>
                <span>Cancelled</span>
              </div>
              <div className="legend-item">
                <div className="legend-indicator today">●</div>
                <span>Today</span>
              </div>
            </div>
          </div>
        <div className="reservation-day-list">
          <div className="list-header">
            <h3>{selectedDate ? formatSelectedDate(selectedDate) : 'Select a Date'}</h3>
            {!selectedDate && (
              <p className="list-hint">
                <CalendarIcon />
                <span>Click any date on the calendar to view reservations</span>
              </p>
            )}
          </div>
          <div className="list-content">
            {selectedDate && (!reservationsByDate[selectedDate] || reservationsByDate[selectedDate].length === 0) && (
              <div className="empty-state">
                <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                  <path d="M9 14h.01M15 14h.01M9 18h.01M15 18h.01" strokeLinecap="round" />
                </svg>
                <p>No reservations scheduled for this date</p>
              </div>
            )}
            {selectedDate && reservationsByDate[selectedDate] && (
              <ul>
                {reservationsByDate[selectedDate].map((r) => (
                  <li key={r.id} className="reservation-list-item">
                    <div className="reservation-guest">
                      <strong>{r.guest?.name || r.guest_name || `Guest #${r.guest_id}`}</strong>
                      <span className="reservation-id">ID: {r.id}</span>
                    </div>
                    <div className="reservation-dates">
                      Room {r.room?.room_number || r.room_id} • {new Date(r.check_in_date).toLocaleDateString()} - {new Date(r.check_out_date).toLocaleDateString()}
                    </div>
                    <div className="reservation-meta">
                      <StatusBadge status={r.status} />
                      <span className="reservation-price">${parseFloat(r.total_price || 0).toFixed(2)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={reservations}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        renderActions={(row) => (
          <div className="table-action-group">
            {row.status === 'pending' && (
              <>
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleAccept(row)}
                  type="button"
                >
                  Accept
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDecline(row)}
                  type="button"
                >
                  Decline
                </button>
              </>
            )}
            {row.status === 'confirmed' && !row.checked_in_at && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleCheckIn(row)}
                type="button"
              >
                Check In
              </button>
            )}
            {row.checked_in_at && !row.checked_out_at && (
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleCheckOut(row)}
                type="button"
              >
                Check Out
              </button>
            )}
          </div>
        )}
      />

      {showModal && (
        <Modal title="Edit Reservation" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label>Guest ID</label>
            <input type="number" value={formData.guest_id} onChange={(e) => setFormData({ ...formData, guest_id: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Room ID</label>
            <input type="number" value={formData.room_id} onChange={(e) => setFormData({ ...formData, room_id: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Check In Date</label>
            <input type="date" value={formData.check_in_date} onChange={(e) => setFormData({ ...formData, check_in_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Check Out Date</label>
            <input type="date" value={formData.check_out_date} onChange={(e) => setFormData({ ...formData, check_out_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </Modal>
      )}
    </div>
  );
}

  const handleDeleteClick = (reservation) => {
    const message = `Are you sure you want to cancel this reservation?\n\nGuest: ${reservation.guest?.name || 'Guest #' + reservation.guest_id}\nRoom: ${reservation.room?.room_number || reservation.room_id}\nDate: ${new Date(reservation.check_in_date).toLocaleDateString()} - ${new Date(reservation.check_out_date).toLocaleDateString()}\n\nThis action cannot be undone.`;
    
    if (confirm(message)) {
      handleDelete(reservation);
    }
  };
