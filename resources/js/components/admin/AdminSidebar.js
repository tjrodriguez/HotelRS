import React from 'react';

export default function AdminSidebar({ activeTab, setActiveTab, user }) {
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD';
  const Icon = ({ name }) => {
    const iconMap = {
      dashboard: (
        <path d="M3 11.5L12 4l9 7.5V20a1 1 0 0 1-1 1h-6v-5h-4v5H4a1 1 0 0 1-1-1v-8.5z" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      ),
      rooms: (
        <>
          <rect x="3" y="5" width="18" height="15" rx="2" strokeWidth="1.7" />
          <path d="M7 12h10M7 16h6" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ),
      reservations: (
        <>
          <rect x="4" y="5" width="16" height="16" rx="2" strokeWidth="1.7" />
          <path d="M8 3v4M16 3v4M4 10h16" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ),
      payments: (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" strokeWidth="1.7" />
          <path d="M3 10h18M7 15h2" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ),
      promotions: (
        <path d="M20 12l-8 8-2.5-2.5L15 12 9.5 6.5 12 4l8 8zM6 8a2 2 0 1 0 0 .01V8z" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      ),
      users: (
        <>
          <path d="M16 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="9.5" cy="7.5" r="3.5" strokeWidth="1.7" />
          <path d="M22 20v-1a4 4 0 0 0-3-3.87M16 4.13a3.5 3.5 0 0 1 0 6.74" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ),
      roomTypes: (
        <>
          <path d="M4 19V9a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v10" strokeWidth="1.7" strokeLinecap="round" />
          <path d="M7 19v-4h10v4M9 12h.01M15 12h.01" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ),
      roomStatuses: (
        <>
          <circle cx="12" cy="12" r="8" strokeWidth="1.7" />
          <path d="M12 8v5l3 2" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ),
      activityLogs: (
        <>
          <path d="M6 3h12a1 1 0 0 1 1 1v16l-3-2-3 2-3-2-3 2V4a1 1 0 0 1 1-1z" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="M9 8h6M9 12h6" strokeWidth="1.7" strokeLinecap="round" />
        </>
      ),
    };

    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        {iconMap[name]}
      </svg>
    );
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'rooms', label: 'Rooms', icon: 'rooms' },
    { id: 'reservations', label: 'Reservations', icon: 'reservations' },
    { id: 'payments', label: 'Payments', icon: 'payments' },
    { id: 'promotions', label: 'Promotions', icon: 'promotions' },
    { id: 'users', label: 'Users', icon: 'users' },
    { id: 'room-types', label: 'Room Types', icon: 'roomTypes' },
    // Room statuses management removed - statuses shown in Rooms table
    { id: 'activity-logs', label: 'Activity Logs', icon: 'activityLogs' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <h2>Luxe Stays</h2>
        <p className="sidebar-subtitle">Management Suite</p>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <span className="icon"><Icon name={item.icon} /></span>
            <span className="label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-chip">{initials}</div>
        <div className="user-meta">
          <strong>{user?.name || 'Admin'}</strong>
          <span>{user?.role === 'admin' ? 'Manager' : 'Front Desk'}</span>
        </div>
      </div>
    </aside>
  );
}
