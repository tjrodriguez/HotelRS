import React, { useState, useEffect } from 'react';
import { apiClient } from '../../services/apiClient';
import DataTable from './DataTable';
import Modal from '../Modal';
import StatusBadge from './StatusBadge';

export default function PromotionsManagement() {
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
  }, []);

  const handleCreate = () => {
    setEditingPromotion(null);
    setFormData({ code: '', discount_percentage: '', valid_from: '', valid_until: '' });
    setShowModal(true);
  };

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getPromotions();
      const items = Array.isArray(data) ? data : data?.data || [];
      setPromotions(items);
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
        await apiClient.deletePromotion(promotion.id);
        setPromotions((previous) => previous.filter((p) => p.id !== promotion.id));
      } catch (error) {
        console.error('Error deleting promotion:', error);
      }
    }
  };

  const handleSave = async () => {
    try {
      if (editingPromotion) {
        const updatedPromotion = await apiClient.updatePromotion(editingPromotion.id, formData);
        setPromotions((previous) => previous.map((p) => (p.id === updatedPromotion.id ? updatedPromotion : p)));
      } else {
        const newPromotion = await apiClient.createPromotion(formData);
        setPromotions((previous) => [newPromotion, ...previous]);
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
