import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import DataTable from './DataTable';
import Modal from '../Modal';

export default function PaymentsManagement() {
  const { token } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [formData, setFormData] = useState({
    reservation_id: '',
    amount: '',
    payment_method: '',
    status: 'pending',
  });

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/payments', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setFormData({
      reservation_id: payment.reservation_id,
      amount: payment.amount,
      payment_method: payment.payment_method,
      status: payment.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (payment) => {
    if (confirm(`Are you sure you want to delete this payment?`)) {
      try {
        await fetch(`/api/payments/${payment.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setPayments(payments.filter((p) => p.id !== payment.id));
      } catch (error) {
        console.error('Error deleting payment:', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingPayment) {
      try {
        const response = await fetch(`/api/payments/${editingPayment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });
        const updatedPayment = await response.json();
        setPayments(payments.map((p) => (p.id === updatedPayment.id ? updatedPayment : p)));
        setShowModal(false);
        setEditingPayment(null);
      } catch (error) {
        console.error('Error updating payment:', error);
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID', align: 'right' },
    { key: 'reservation_id', label: 'Reservation ID', align: 'right' },
    { key: 'amount', label: 'Amount', align: 'right', render: (val) => `$${parseFloat(val).toFixed(2)}` },
    { key: 'payment_method', label: 'Method' },
    { key: 'status', label: 'Status' },
  ];

  return (
    <div className="management-container">
      <h2>Payments Management</h2>
      <DataTable columns={columns} data={payments} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

      {showModal && (
        <Modal title="Edit Payment" onClose={() => setShowModal(false)}>
          <div className="form-group">
            <label>Reservation ID</label>
            <input type="number" value={formData.reservation_id} onChange={(e) => setFormData({ ...formData, reservation_id: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Payment Method</label>
            <input type="text" value={formData.payment_method} onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
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
