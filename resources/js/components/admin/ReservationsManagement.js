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
      setReservations(data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    } finally {
      setIsLoading(false);
    }
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

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'guest_id', label: 'Guest ID' },
    { key: 'room_id', label: 'Room ID' },
    { key: 'check_in_date', label: 'Check In' },
    { key: 'check_out_date', label: 'Check Out' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="management-container">
      <h2>Reservations Management</h2>
      <DataTable columns={columns} data={reservations} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

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
