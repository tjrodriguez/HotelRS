import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import DataTable from './DataTable';
import Modal from '../Modal';

export default function RoomStatusesManagement() {
  const { token } = useContext(AuthContext);
  const [roomStatuses, setRoomStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingStatus, setEditingStatus] = useState(null);
  const [formData, setFormData] = useState({ status_name: '' });

  useEffect(() => {
    fetchRoomStatuses();
  }, [token]);

  const fetchRoomStatuses = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/room-statuses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRoomStatuses(data);
    } catch (error) {
      console.error('Error fetching room statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (status) => {
    setEditingStatus(status);
    setFormData({ status_name: status.status_name });
    setShowModal(true);
  };

  const handleDelete = async (status) => {
    if (confirm(`Are you sure you want to delete ${status.status_name}?`)) {
      try {
        await fetch(`/api/room-statuses/${status.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoomStatuses(roomStatuses.filter((s) => s.id !== status.id));
      } catch (error) {
        console.error('Error deleting room status:', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingStatus) {
      try {
        const response = await fetch(`/api/room-statuses/${editingStatus.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const updatedStatus = await response.json();
        setRoomStatuses(roomStatuses.map((s) => (s.id === updatedStatus.id ? updatedStatus : s)));
        setShowModal(false);
        setEditingStatus(null);
      } catch (error) {
        console.error('Error updating room status:', error);
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'status_name', label: 'Status Name' },
  ];

  return (
    <div className="management-container">
      <h2>Room Statuses Management</h2>
      <DataTable columns={columns} data={roomStatuses} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal title="Edit Room Status" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label>Status Name</label>
            <input
              type="text"
              value={formData.status_name}
              onChange={(e) => setFormData({ ...formData, status_name: e.target.value })}
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
