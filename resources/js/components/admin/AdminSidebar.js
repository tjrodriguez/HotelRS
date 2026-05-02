import React from 'react';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '◧' },
    { id: 'rooms', label: 'Rooms', icon: '▣' },
    { id: 'reservations', label: 'Reservations', icon: '▤' },
    { id: 'payments', label: 'Payments', icon: '▥' },
    { id: 'promotions', label: 'Promotions', icon: '◈' },
    { id: 'users', label: 'Users', icon: '◌' },
    { id: 'room-types', label: 'Room Types', icon: '◍' },
    { id: 'room-statuses', label: 'Room Statuses', icon: '◎' },
    { id: 'activity-logs', label: 'Activity Logs', icon: '◫' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Hotel Platil</h2>
        <p className="sidebar-subtitle">Management Suite</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <span className="icon">{item.icon}</span>
            <span className="label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">AD</div>
        <div className="user-meta">
          <strong>Admin</strong>
          <span>Front Desk</span>
        </div>
      </div>
    </aside>
  );
}
