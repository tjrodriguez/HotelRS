import React, { useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import AdminSidebar from '../components/admin/AdminSidebar';
import UsersManagement from '../components/admin/UsersManagement';
import RoomsManagement from '../components/admin/RoomsManagement';
import RoomTypesManagement from '../components/admin/RoomTypesManagement';
import RoomStatusesManagement from '../components/admin/RoomStatusesManagement';
import ReservationsManagement from '../components/admin/ReservationsManagement';
import PaymentsManagement from '../components/admin/PaymentsManagement';
import PromotionsManagement from '../components/admin/PromotionsManagement';
import ActivityLogsManagement from '../components/admin/ActivityLogsManagement';

export default function AdminDashboard() {
  const { logout, user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
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
      case 'room-statuses':
        return <RoomStatusesManagement />;
      case 'reservations':
        return <ReservationsManagement />;
      case 'payments':
        return <PaymentsManagement />;
      case 'promotions':
        return <PromotionsManagement />;
      case 'activity-logs':
        return <ActivityLogsManagement />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="admin-main">
        <div className="admin-header">
          <h1>{activeTab === 'dashboard' ? 'Overview' : 'Operations'}</h1>
          <div className="admin-user-info">
            <span>{today}</span>
            <button onClick={logout} className="btn btn-secondary">
              Logout
            </button>
          </div>
        </div>
        <div className="admin-content">{renderContent()}</div>
      </main>
    </div>
  );
}

function DashboardHome() {
  const weeklyRevenue = [32.4, 28.1, 41.2, 37.8, 44.6, 52.3, 48.2];
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const activityItems = [
    'Reservation #1042 created for Liza Cruz (Room 101)',
    'Payment of P29,250 received from Ana Reyes (Credit Card)',
    'Ben Flores checked in - Room 402',
    'Promo SUMMER10 applied to reservation #1047',
    'Room 304 status updated to Occupied',
    'New user created: Ben Flores',
  ];

  return (
    <div className="dashboard-home">
      <h2>Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Occupancy</h3>
          <p className="stat-number">73%</p>
          <p className="stat-note">22 of 30 rooms</p>
        </div>
        <div className="stat-card">
          <h3>Revenue Today</h3>
          <p className="stat-number">P48,200</p>
          <p className="stat-note">+12% vs yesterday</p>
        </div>
        <div className="stat-card">
          <h3>Check-ins Today</h3>
          <p className="stat-number">7</p>
          <p className="stat-note">3 pending</p>
        </div>
        <div className="stat-card">
          <h3>Active Promos</h3>
          <p className="stat-number">4</p>
          <p className="stat-note">2 expiring soon</p>
        </div>
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
      </div>
    </div>
  );
}
