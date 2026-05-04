import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import DataTable from './DataTable';
import Modal from '../Modal';
import StatusBadge from './StatusBadge';

export default function RoomsManagement() {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    room_number: '',
    room_type_id: '',
    status: 'available',
    price_per_night: '',
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getRooms();
      const items = Array.isArray(data) ? data : data?.data || [];
      setRooms(items);
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type_id: room.room_type_id,
      status: room.status || 'available',
      price_per_night: room.price_per_night,
    });
    setShowModal(true);
  };

  const handleDelete = async (room) => {
    if (confirm(`Are you sure you want to delete Room ${room.room_number}?`)) {
      try {
        await apiClient.deleteRoom(room.id);
        setRooms((previous) => previous.filter((r) => r.id !== room.id));
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingRoom) {
      try {
        const updatedRoom = await apiClient.updateRoom(editingRoom.id, formData);
        setRooms((previous) => previous.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
        setShowModal(false);
        setEditingRoom(null);
      } catch (error) {
        console.error('Error updating room:', error);
      }
    }
  };

  const filteredRooms = filterStatus === 'all' ? rooms : rooms.filter((r) => r.status === filterStatus);

  const availableCount = rooms.filter((r) => r.status === 'available').length;
  const occupiedCount = rooms.filter((r) => r.status === 'occupied').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'maintenance' || r.status === 'cleaning' || r.status === 'out_of_order').length;

  const columns = [
    { key: 'id', label: 'ID', align: 'right' },
    { key: 'room_number', label: 'Room Number' },
    { key: 'room_type', label: 'Type', render: (val) => val?.name || 'Unknown' },
    {
      key: 'status',
      label: 'Status',
      render: (val) => <StatusBadge status={val} label={val ? val.charAt(0).toUpperCase() + val.slice(1) : 'Unknown'} />,
    },
    { key: 'price_per_night', label: 'Price/Night', align: 'right', render: (val) => `$${val ? parseFloat(val).toFixed(2) : '0.00'}` },
  ];

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Rooms Management</h2>
        <div className="room-stats">
          <div className="stat-card available">
            <span className="stat-label">Available</span>
            <span className="stat-value">{availableCount}</span>
          </div>
          <div className="stat-card occupied">
            <span className="stat-label">Occupied</span>
            <span className="stat-value">{occupiedCount}</span>
          </div>
          <div className="stat-card maintenance">
            <span className="stat-label">Maintenance</span>
            <span className="stat-value">{maintenanceCount}</span>
          </div>
        </div>
      </div>
      {error && <div className="error-alert">{error}</div>}
      <div className="filter-bar">
        <label>Filter by Status:</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Rooms ({rooms.length})</option>
          <option value="available">Available ({availableCount})</option>
          <option value="occupied">Occupied ({occupiedCount})</option>
          <option value="cleaning">Cleaning</option>
          <option value="maintenance">Maintenance</option>
          <option value="out_of_order">Out of Order</option>
        </select>
      </div>
      <DataTable columns={columns} data={filteredRooms} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal title="Edit Room" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label>Room Number</label>
            <input
              type="text"
              value={formData.room_number}
              onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Type ID</label>
            <input
              type="number"
              value={formData.room_type_id}
              onChange={(e) => setFormData({ ...formData, room_type_id: e.target.value })}
            />
          </div>
          <div className="form-group status-row">
            <label>Status</label>
            <div>
              <select
                className={`status-select ${formData.status}`}
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="cleaning">Cleaning</option>
                <option value="maintenance">Maintenance</option>
                <option value="out_of_order">Out of Order</option>
              </select>

              <span className={`status-badge status-${formData.status}`} aria-hidden />
            </div>
          </div>
          <div className="form-group">
            <label>Price Per Night</label>
            <input
              type="number"
              value={formData.price_per_night}
              onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
            />
          </div>
          <button onClick={handleSave} className="btn btn-primary">
            Save
          </button>
        </Modal>
      )}
    </div>
  );
}
