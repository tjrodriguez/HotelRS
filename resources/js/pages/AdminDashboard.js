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
          <h1>Admin Dashboard</h1>
          <div className="admin-user-info">
            <span>Welcome, {user?.name}</span>
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
  return (
    <div className="dashboard-home">
      <h2>Dashboard Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Reservations</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Rooms Available</h3>
          <p className="stat-number">0</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">$0</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p className="stat-number">0</p>
        </div>
      </div>
    </div>
  );
}
