import React from 'react';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'rooms', label: 'Rooms', icon: '🛏️' },
    { id: 'room-types', label: 'Room Types', icon: '🏷️' },
    { id: 'room-statuses', label: 'Room Statuses', icon: '📍' },
    { id: 'reservations', label: 'Reservations', icon: '📅' },
    { id: 'payments', label: 'Payments', icon: '💳' },
    { id: 'promotions', label: 'Promotions', icon: '🎟️' },
    { id: 'activity-logs', label: 'Activity Logs', icon: '📝' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Hotel Admin</h2>
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
    </aside>
  );
}
