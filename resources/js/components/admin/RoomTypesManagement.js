import React, { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import DataTable from './DataTable';
import Modal from '../Modal';

export default function RoomTypesManagement() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const fetchRoomTypes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getRoomTypes();
      setRoomTypes(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching room types:', error);
      setError('Failed to load room types. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({ name: type.name, description: type.description });
    setShowModal(true);
  };

  const handleDelete = async (type) => {
    if (confirm(`Are you sure you want to delete ${type.name}?`)) {
      try {
        await apiClient.deleteRoomType(type.id);
        setRoomTypes((previous) => previous.filter((t) => t.id !== type.id));
      } catch (error) {
        console.error('Error deleting room type:', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingType) {
      try {
        const updatedType = await apiClient.updateRoomType(editingType.id, formData);
        setRoomTypes((previous) => previous.map((t) => (t.id === updatedType.id ? updatedType : t)));
        setShowModal(false);
        setEditingType(null);
      } catch (error) {
        console.error('Error updating room type:', error);
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID', align: 'right' },
    { key: 'name', label: 'Name' },
    { key: 'description', label: 'Description' },
  ];

  return (
    <div className="management-container">
      {error && <div className="error-alert">{error}</div>}
      <h2>Room Types Management</h2>
      <DataTable columns={columns} data={roomTypes} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal title="Edit Room Type" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
