import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from './components/layouts/AdminLayout';
import GuestLayout from './components/layouts/GuestLayout';
import AuthGuard from './components/guards/AuthGuard';
import AdminGuard from './components/guards/AdminGuard';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import GuestBooking from './pages/GuestBooking';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<AuthGuard><GuestLayout /></AuthGuard>}>
        <Route path="/book" element={<GuestBooking />} />
        <Route path="/my-reservations" element={<GuestBooking />} />
        <Route path="/my-payments" element={<GuestBooking />} />
        <Route path="/" element={<GuestBooking />} />
      </Route>

      <Route element={<AdminGuard><AdminLayout /></AdminGuard>}>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/rooms" element={<AdminDashboard />} />
        <Route path="/admin/reservations" element={<AdminDashboard />} />
        <Route path="/admin/payments" element={<AdminDashboard />} />
        <Route path="/admin/promotions" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminDashboard />} />
        <Route path="/admin/room-types" element={<AdminDashboard />} />
        <Route path="/admin/activity-logs" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}
