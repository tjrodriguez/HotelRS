import React, { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import AdminDashboard from './pages/AdminDashboard';
import GuestBooking from './pages/GuestBooking';
import Login from './pages/Login';

export default function App() {
  const { isAuthenticated, isAdmin } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Login />;
  }

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return <GuestBooking />;
}
