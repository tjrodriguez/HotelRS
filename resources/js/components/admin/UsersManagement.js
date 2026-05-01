import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import DataTable from './DataTable';
import Modal from '../Modal';
const apiClient = require('../../services/apiClient').default;

export default function UsersManagement() {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'guest' });

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role });
    setShowModal(true);
  };

  const handleDelete = async (user) => {
    if (confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        await fetch(`/api/users/${user.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(users.filter((u) => u.id !== user.id));
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingUser) {
      try {
        const response = await fetch(`/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const updatedUser = await response.json();
        setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
        setShowModal(false);
        setEditingUser(null);
      } catch (error) {
        console.error('Error updating user:', error);
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
  ];

  return (
    <div className="management-container">
      <h2>Users Management</h2>
      <DataTable columns={columns} data={users} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal title="Edit User" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
              <option value="guest">Guest</option>
              <option value="admin">Admin</option>
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
