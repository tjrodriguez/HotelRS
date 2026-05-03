import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AdminSidebar from '../admin/AdminSidebar';

const PATH_TO_TAB = {
  '/admin/dashboard': 'dashboard',
  '/admin/rooms': 'rooms',
  '/admin/reservations': 'reservations',
  '/admin/payments': 'payments',
  '/admin/promotions': 'promotions',
  '/admin/users': 'users',
  '/admin/room-types': 'room-types',
  '/admin/activity-logs': 'activity-logs',
};

const TAB_TO_PATH = {
  'dashboard': '/admin/dashboard',
  'rooms': '/admin/rooms',
  'reservations': '/admin/reservations',
  'payments': '/admin/payments',
  'promotions': '/admin/promotions',
  'users': '/admin/users',
  'room-types': '/admin/room-types',
  'activity-logs': '/admin/activity-logs',
};

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    return PATH_TO_TAB[location.pathname] || 'dashboard';
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    navigate(TAB_TO_PATH[tab] || '/admin/dashboard');
  };

  return (
    <div className="admin-dashboard">
      <AdminSidebar activeTab={activeTab} setActiveTab={handleTabChange} user={user} />
      <main className="admin-main">
        <Outlet context={{ activeTab, setActiveTab: handleTabChange }} />
      </main>
    </div>
  );
}
