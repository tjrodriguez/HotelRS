import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';
import Loading from '../components/shared/Loading';
import ErrorDisplay from '../components/shared/ErrorDisplay';
import UsersManagement from '../components/admin/UsersManagement';
import RoomsManagement from '../components/admin/RoomsManagement';
import RoomTypesManagement from '../components/admin/RoomTypesManagement';
import ReservationsManagement from '../components/admin/ReservationsManagement';
import PaymentsManagement from '../components/admin/PaymentsManagement';
import PromotionsManagement from '../components/admin/PromotionsManagement';
import ActivityLogsManagement from '../components/admin/ActivityLogsManagement';
import Notifications from '../components/Notifications';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { activeTab, setActiveTab } = useOutletContext();
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'users':
        return <UsersManagement />;
      case 'rooms':
        return <RoomsManagement />;
      case 'room-types':
        return <RoomTypesManagement />;
      case 'reservations':
        return <ReservationsManagement />;
      case 'payments':
        return <PaymentsManagement />;
      case 'promotions':
        return <PromotionsManagement />;
      case 'activity-logs':
        return <ActivityLogsManagement />;
      default:
        return <DashboardHome setActiveTab={setActiveTab} />;
    }
  };

  return (
    <>
      <div className="admin-header">
        <div className="admin-heading">
          <span className="admin-eyebrow">Operations Center</span>
          <h1>{activeTab === 'dashboard' ? 'Operations Overview' : 'Operations'}</h1>
          <p className="header-subtitle">Front office and room management control center</p>
        </div>
        <div className="admin-user-info">
          <span className="admin-badge">{user?.role || 'Administrator'}</span>
          <Notifications userType="admin" />
          <span className="header-date">{today}</span>
        </div>
      </div>
      <div className="admin-content">{renderContent()}</div>
    </>
  );
}

function DashboardHome({ setActiveTab }) {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    apiClient.getDashboardStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      });
  }, [token]);

  if (loading) return <Loading />;
  if (error) return <ErrorDisplay message={error} />;
  if (!stats) return null;

  const s = stats.stats;
  const weekly = stats.weekly_revenue;
  const activityItems = stats.recent_activity || [];
  const maxRevenue = Math.max(...weekly.values, 1);

  const cards = [
    {
      title: 'Occupancy',
      value: `${s.occupancy_rate}%`,
      note: `${s.occupied_rooms} of ${s.total_rooms} rooms`,
      trend: s.occupancy_rate >= 70 ? 'High' : 'Low',
      trendClass: s.occupancy_rate >= 70 ? 'success' : 'neutral',
      icon: (
        <path d="M3 20V10l9-7 9 7v10M7 20v-6h10v6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      title: 'Revenue Today',
      value: `P${parseFloat(s.today_revenue).toLocaleString()}`,
      note: 'Total completed payments',
      trend: 'Live',
      trendClass: 'success',
      icon: (
        <>
          <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth="1.8" />
          <path d="M3 10h18M7 14h3" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ),
    },
    {
      title: 'Check-ins Today',
      value: String(s.check_ins_today),
      note: `${s.check_outs_today} check-outs today`,
      trend: 'On track',
      trendClass: 'neutral',
      icon: (
        <>
          <path d="M4 6h16v12H4z" strokeWidth="1.8" />
          <path d="M8 3v6M16 3v6M4 10h16" strokeWidth="1.8" strokeLinecap="round" />
        </>
      ),
    },
    {
      title: 'Active Promos',
      value: String(s.active_promotions),
      note: 'Currently running',
      trend: 'Review',
      trendClass: 'warning',
      icon: (
        <path d="M20 12l-8 8-2.5-2.5L15 12 9.5 6.5 12 4l8 8zM6 8a2 2 0 1 0 0 .01V8z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
  ];

  const quickActions = [
    { label: 'New Reservation', tab: 'reservations' },
    { label: 'Check In Guest', tab: 'reservations' },
    { label: 'Add Promotion', tab: 'promotions' },
    { label: 'Manage Rooms', tab: 'rooms' },
  ];

  return (
    <div className="dashboard-home">
      <h2>Today at a Glance</h2>
      <div className="stats-grid">
        {cards.map((card) => (
          <div className="stat-card" key={card.title}>
            <div className="stat-top-row">
              <span className="stat-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none">{card.icon}</svg>
              </span>
              <span className={`stat-trend ${card.trendClass}`}>{card.trend}</span>
            </div>
            <h3>{card.title}</h3>
            <p className="stat-number">{card.value}</p>
            <p className="stat-note">{card.note}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-panels">
        <section className="dashboard-panel">
          <h3>Weekly Revenue</h3>
          <div className="revenue-list">
            {weekly.labels.map((day, index) => (
              <div className="revenue-item" key={day}>
                <span className="weekday">{day}</span>
                <div className="revenue-bar-track">
                  <span className="revenue-bar" style={{ width: `${(weekly.values[index] / maxRevenue) * 100}%` }} />
                </div>
                <span className="amount">P{weekly.values[index].toLocaleString()}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {activityItems.length === 0 ? (
              <li><p>No recent activity.</p></li>
            ) : (
              activityItems.map((item) => (
                <li key={item.id}>
                  <span className="dot" />
                  <div>
                    <p>{item.action} {item.entity_type} #{item.entity_id}</p>
                    <span>{new Date(item.created_at).toLocaleTimeString()}</span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="dashboard-panel quick-actions-panel">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <button key={action.label} type="button" onClick={() => setActiveTab(action.tab)}>
                {action.label}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
