import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import DataTable from './DataTable';
import Modal from '../Modal';

export default function RoomTypesManagement() {
  const { token } = useContext(AuthContext);
  const [roomTypes, setRoomTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchRoomTypes();
  }, [token]);

  const fetchRoomTypes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/room-types', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRoomTypes(data);
    } catch (error) {
      console.error('Error fetching room types:', error);
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
        await fetch(`/api/room-types/${type.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setRoomTypes(roomTypes.filter((t) => t.id !== type.id));
      } catch (error) {
        console.error('Error deleting room type:', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingType) {
      try {
        const response = await fetch(`/api/room-types/${editingType.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const updatedType = await response.json();
        setRoomTypes(roomTypes.map((t) => (t.id === updatedType.id ? updatedType : t)));
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
