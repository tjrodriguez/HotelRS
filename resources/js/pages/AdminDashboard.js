import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UsersManagement from '../components/admin/UsersManagement';
import RoomsManagement from '../components/admin/RoomsManagement';
import RoomTypesManagement from '../components/admin/RoomTypesManagement';
import ReservationsManagement from '../components/admin/ReservationsManagement';
import PaymentsManagement from '../components/admin/PaymentsManagement';
import PromotionsManagement from '../components/admin/PromotionsManagement';
import ActivityLogsManagement from '../components/admin/ActivityLogsManagement';

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
        <div>
          <h1>{activeTab === 'dashboard' ? 'Operations Overview' : 'Operations'}</h1>
          <p className="header-subtitle">Front office and room management control center</p>
        </div>
        <div className="admin-user-info">
          <span className="admin-badge">{user?.role || 'Administrator'}</span>
          <span className="header-date">{today}</span>
        </div>
      </div>
      <div className="admin-content">{renderContent()}</div>
    </>
  );
}

function DashboardHome({ setActiveTab }) {
  const weeklyRevenue = [32.4, 28.1, 41.2, 37.8, 44.6, 52.3, 48.2];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const cards = [
    {
      title: 'Occupancy',
      value: '73%',
      note: '22 of 30 rooms',
      trend: '+4.2%',
      trendClass: 'success',
      icon: (
        <path d="M3 20V10l9-7 9 7v10M7 20v-6h10v6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
    {
      title: 'Revenue Today',
      value: 'P48,200',
      note: '+12% vs yesterday',
      trend: '+12%',
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
      value: '7',
      note: '3 pending arrival',
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
      value: '4',
      note: '2 expiring in 48h',
      trend: 'Review',
      trendClass: 'warning',
      icon: (
        <path d="M20 12l-8 8-2.5-2.5L15 12 9.5 6.5 12 4l8 8zM6 8a2 2 0 1 0 0 .01V8z" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      ),
    },
  ];

  const activityItems = [
    'Reservation #1042 created for Liza Cruz (Room 101)',
    'Payment of P29,250 received from Ana Reyes (Credit Card)',
    'Ben Flores checked in - Room 402',
    'Promo SUMMER10 applied to reservation #1047',
    'Room 304 status updated to Occupied',
    'New user created: Ben Flores',
  ];

  const quickActions = [
    { label: 'New Reservation', tab: 'reservations' },
    { label: 'Check In Guest', tab: 'rooms' },
    { label: 'Add Promotion', tab: 'promotions' },
    { label: 'Mark Room Clean', tab: 'rooms' },
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
            {weeklyRevenue.map((amount, index) => (
              <div className="revenue-item" key={weekDays[index]}>
                <span className="weekday">{weekDays[index]}</span>
                <div className="revenue-bar-track">
                  <span className="revenue-bar" style={{ width: `${(amount / 55) * 100}%` }} />
                </div>
                <span className="amount">P{amount.toFixed(1)}k</span>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <h3>Recent Activity</h3>
          <ul className="activity-list">
            {activityItems.map((item, index) => (
              <li key={item}>
                <span className="dot" />
                <div>
                  <p>{item}</p>
                  <span>{index < 5 ? `${9 - index}:${(14 - index * 7).toString().padStart(2, '0')} AM` : 'Yesterday'}</span>
                </div>
              </li>
            ))}
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
