import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import DataTable from './DataTable';
import Modal from '../Modal';

export default function RoomsManagement() {
  const { token } = useContext(AuthContext);
  const [rooms, setRooms] = useState([]);
  const [roomStatuses, setRoomStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_number: '',
    room_type_id: '',
    room_status_id: '',
    price_per_night: '',
  });

  useEffect(() => {
    fetchRooms();
  }, [token]);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/rooms', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setRooms(data);
      // derive statuses from rooms payload (pagination -> data or array)
      const items = Array.isArray(data) ? data : data?.data || [];
      const map = {};
      items.forEach((r) => {
        if (r.room_status && r.room_status.id) {
          map[r.room_status.id] = r.room_status;
        } else if (r.room_status_id) {
          const id = r.room_status_id;
          if (!map[id]) {
            map[id] = { id: id, status_name: id == 2 ? 'Occupied' : 'Vacant' };
          }
        }
      });
      setRoomStatuses(Object.values(map));
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      room_number: room.room_number,
      room_type_id: room.room_type_id,
      room_status_id: room.room_status_id,
      price_per_night: room.price_per_night,
    });
    setShowModal(true);
  };

  const handleDelete = async (room) => {
    if (confirm(`Are you sure you want to delete Room ${room.room_number}?`)) {
      try {
        await fetch(`/api/rooms/${room.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
        setRooms(rooms.filter((r) => r.id !== room.id));
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const handleSave = async () => {
    if (editingRoom) {
      try {
        const payload = { ...formData, room_status_id: Number(formData.room_status_id) };
        const response = await fetch(`/api/rooms/${editingRoom.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const updatedRoom = await response.json();
        setRooms(rooms.map((r) => (r.id === updatedRoom.id ? updatedRoom : r)));
        setShowModal(false);
        setEditingRoom(null);
      } catch (error) {
        console.error('Error updating room:', error);
      }
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'room_number', label: 'Room Number' },
    { key: 'room_type_id', label: 'Type' },
    {
      key: 'room_status_id',
      label: 'Status',
      render: (val, row) => {
        const statusName = row.room_status?.status_name || (val == 2 ? 'Occupied' : 'Vacant');
        const key = (row.room_status?.status_name || statusName).toLowerCase();
        const className = key.includes('occup') ? 'status-occupied' : key.includes('avail') || key.includes('vacant') ? 'status-available' : 'status-default';
        return (
          <span className={`table-status ${className}`}>
            <span className="dot" aria-hidden />
            {statusName}
          </span>
        );
      },
    },
    { key: 'price_per_night', label: 'Price/Night', render: (val) => `$${val}` },
  ];

  return (
    <div className="management-container">
      <h2>Rooms Management</h2>
      <DataTable columns={columns} data={rooms} isLoading={isLoading} onEdit={handleEdit} onDelete={handleDelete} />

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
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <select
                className={`status-select ${formData.room_status_id == 1 ? 'available' : formData.room_status_id == 2 ? 'occupied' : ''}`}
                value={formData.room_status_id}
                onChange={(e) => setFormData({ ...formData, room_status_id: e.target.value })}
              >
                {roomStatuses.length > 0 ? (
                  roomStatuses.map((s) => (
                    <option key={s.id} value={s.id}>{s.status_name}</option>
                  ))
                ) : (
                  <>
                    <option value={1}>Vacant</option>
                    <option value={2}>Occupied</option>
                  </>
                )}
              </select>

              <span className={`status-badge ${formData.room_status_id == 1 ? 'status-available' : formData.room_status_id == 2 ? 'status-occupied' : 'status-default'}`} aria-hidden />
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
