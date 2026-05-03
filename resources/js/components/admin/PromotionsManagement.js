import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import DataTable from './DataTable';
import Modal from '../Modal';
import StatusBadge from './StatusBadge';

export default function PromotionsManagement() {
  const { token } = useContext(AuthContext);
  const [promotions, setPromotions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_percentage: '',
    valid_from: '',
    valid_until: '',
  });

  useEffect(() => {
    fetchPromotions();
  }, [token]);

  const handleCreate = () => {
    setEditingPromotion(null);
    setFormData({ code: '', discount_percentage: '', valid_from: '', valid_until: '' });
    setShowModal(true);
  };

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/promotions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      code: promotion.code,
      discount_percentage: promotion.discount_percentage,
      valid_from: promotion.valid_from,
      valid_until: promotion.valid_until,
    });
    setShowModal(true);
  };

  const handleDelete = async (promotion) => {
    if (confirm(`Are you sure you want to delete the ${promotion.code} promotion?`)) {
      try {
        await fetch(`/api/promotions/${promotion.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setPromotions(promotions.filter((p) => p.id !== promotion.id));
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingPromotion) {
        const response = await fetch(`/api/promotions/${editingPromotion.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const updatedPromotion = await response.json();
        setPromotions(promotions.map((p) => (p.id === updatedPromotion.id ? updatedPromotion : p)));
      } else {
        const response = await fetch(`/api/promotions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const newPromotion = await response.json();
        setPromotions([newPromotion, ...promotions]);
      }
      setShowModal(false);
      setEditingPromotion(null);
    } catch (error) {
      console.error('Error saving promotion:', error);
    }
  };

  const columns = [
    { key: 'id', label: 'ID', align: 'right' },
    { key: 'code', label: 'Code' },
    { key: 'discount_percentage', label: 'Discount', align: 'right', render: (val) => `${val}%` },
    { key: 'valid_from', label: 'Valid From' },
    { key: 'valid_until', label: 'Valid Until' },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const now = new Date();
        const from = row.valid_from ? new Date(row.valid_from) : null;
        const until = row.valid_until ? new Date(row.valid_until) : null;
        let status = 'inactive';
        let label = 'Inactive';
        if (from && until && now >= from && now <= until) {
          status = 'active'; label = 'Active';
        } else if (until && now > until) {
          status = 'expired'; label = 'Expired';
        } else if (from && now < from) {
          status = 'upcoming'; label = 'Upcoming';
        }
        return <StatusBadge status={status} label={label} />;
      }
    },
  ];

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Promotions Management</h2>
        <button className="btn btn-primary" onClick={handleCreate}>New Promotion</button>
      </div>
      <DataTable columns={columns} data={promotions} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal title="Edit Promotion" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label>Code</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Discount Percentage</label>
            <input
              type="number"
              value={formData.discount_percentage}
              onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Valid From</label>
            <input
              type="date"
              value={formData.valid_from}
              onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Valid Until</label>
            <input
              type="date"
              value={formData.valid_until}
              onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
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
