import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import DataTable from './DataTable';
import Modal from '../Modal';

export default function ReservationsManagement() {
  const { token } = useContext(AuthContext);
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
  }, [token]);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/reservations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      
      // Handle paginated response
      const reservationList = Array.isArray(data) ? data : data.data || [];
      
      console.log('Fetched reservations:', reservationList);
      setReservations(reservationList);
      
      // reset calendar selection
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

  const reservationsByDate = buildDateMap(reservations);

  const firstDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const lastDayOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

  const goMonth = (offset) => setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + offset, 1));

  const getCalendarDays = (monthDate) => {
    const start = firstDayOfMonth(monthDate);
    const end = lastDayOfMonth(monthDate);
    const startWeekday = start.getDay(); // 0..6
    const days = [];
    // previous month's tail
    for (let i = 0; i < startWeekday; i++) days.push(null);
    for (let d = 1; d <= end.getDate(); d++) days.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), d));
    // ensure full weeks (multiple of 7)
    while (days.length % 7 !== 0) days.push(null);
    return days;
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
    if (confirm(`Are you sure you want to delete this reservation?`)) {
      try {
        await fetch(`/api/reservations/${reservation.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setReservations(reservations.filter((r) => r.id !== reservation.id));
      } catch (error) {
        console.error('Error deleting reservation:', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingReservation) {
      try {
        const response = await fetch(`/api/reservations/${editingReservation.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const updatedReservation = await response.json();
        setReservations(reservations.map((r) => (r.id === updatedReservation.id ? updatedReservation : r)));
        setShowModal(false);
        setEditingReservation(null);
      } catch (error) {
        console.error('Error updating reservation:', error);
      }
    }
  };

  const handleAccept = async (reservation) => {
    try {
      const response = await fetch(`/api/reservations/${reservation.id}/confirm`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to accept reservation');
      }

      const updatedReservation = await response.json();
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
      const response = await fetch(`/api/reservations/${reservation.id}/decline`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to decline reservation');
      }

      const updatedReservation = await response.json();
      setReservations((previous) => previous.map((item) => (
        item.id === updatedReservation.id ? updatedReservation : item
      )));
    } catch (error) {
      console.error('Error declining reservation:', error);
      alert('Could not decline this reservation.');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
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
      render: (value, row) => `$${parseFloat(row.paid_amount ?? 0).toFixed(2)}`,
    },
    {
      key: 'balance_due',
      label: 'Balance',
      render: (value, row) => `$${parseFloat(row.balance_due ?? 0).toFixed(2)}`,
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => {
        const statusColors = {
          'pending': '#f59e0b',
          'confirmed': '#10b981',
          'completed': '#6b7280',
          'cancelled': '#ef4444',
        };
        return (
          <span style={{ 
            color: statusColors[value] || '#6b7280',
            fontWeight: 600,
            textTransform: 'capitalize'
          }}>
            {value}
          </span>
        );
      }
    },
  ];


  return (
    <div className="management-container">
      <h2>Reservations Management</h2>
      <div className="reservations-calendar-wrap">
        <div className="calendar">
          <div className="calendar-header">
            <button className="btn-icon" onClick={() => goMonth(-1)}>{'‹'}</button>
            <div className="calendar-title">{formatMonthTitle(currentMonth)}</div>
            <button className="btn-icon" onClick={() => goMonth(1)}>{'›'}</button>
          </div>
          <div className="calendar-grid">
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d) => (
              <div key={d} className="calendar-weekday">{d}</div>
            ))}
            {getCalendarDays(currentMonth).map((day, idx) => {
              if (!day) return <div key={idx} className="calendar-day empty" />;
              const key = day.toISOString().slice(0,10);
              const has = reservationsByDate[key] && reservationsByDate[key].length > 0;
              const isToday = key === new Date().toISOString().slice(0,10);
              const classes = ['calendar-day', has ? 'reserved' : '', isToday ? 'today' : '', selectedDate === key ? 'selected' : ''].join(' ');
              return (
                <div key={idx} className={classes} onClick={() => setSelectedDate(key)}>
                  <div className="date-num">{day.getDate()}</div>
                  {has && <div className="dot" />}
                </div>
              );
            })}
          </div>
        </div>
        <div className="reservation-day-list">
          <h3>{selectedDate ? formatSelectedDate(selectedDate) : 'Select a date'}</h3>
          {!selectedDate && <p className="muted">Click a highlighted date to see reservations.</p>}
          {selectedDate && (!reservationsByDate[selectedDate] || reservationsByDate[selectedDate].length === 0) && (
            <p>No reservations on this date.</p>
          )}
          {selectedDate && reservationsByDate[selectedDate] && (
            <ul>
              {reservationsByDate[selectedDate].map((r) => (
                <li key={r.id} className="reservation-list-item">
                  <div style={{ marginBottom: '8px' }}>
                    <strong>{r.guest?.name || r.guest_name || `Guest #${r.guest_id}`}</strong>
                    <span style={{ marginLeft: '8px', color: '#6b7280', fontSize: '12px' }}>ID: {r.id}</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#475569' }}>
                    Room {r.room?.room_number || r.room_id} • {new Date(r.check_in_date).toLocaleDateString()} - {new Date(r.check_out_date).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '13px', marginTop: '4px' }}>
                    <span style={{ 
                      color: r.status === 'confirmed' ? '#10b981' : r.status === 'pending' ? '#f59e0b' : r.status === 'cancelled' ? '#ef4444' : '#6b7280',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {r.status}
                    </span>
                    <span style={{ marginLeft: '12px', color: '#6b7280' }}>
                      ${parseFloat(r.total_price || 0).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={reservations}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        renderActions={(row) => (
          row.status === 'pending' ? (
            <div className="table-action-group">
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
            </div>
          ) : null
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
