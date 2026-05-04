import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';

export default function GuestProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({ name: '', phone: '', address: '' });
  const [passwordData, setPasswordData] = useState({ current_password: '', password: '', password_confirmation: '' });
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileError, setProfileError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (user) {
      setProfile({ name: user.name || '', phone: user.phone || '', address: user.address || '' });
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMessage('');
    setProfileError('');
    try {
      const data = await apiClient.updateProfile(profile);
      setProfileMessage('Profile updated successfully.');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    try {
      await apiClient.changePassword(passwordData);
      setPasswordMessage('Password changed successfully.');
      setPasswordData({ current_password: '', password: '', password_confirmation: '' });
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    }
  };

  return (
    <div className="guest-main">
      <div className="guest-profile">
        <h2>My Profile</h2>

      <section className="profile-section">
        <h3>Personal Information</h3>
        {profileMessage && <div className="form-success">{profileMessage}</div>}
        {profileError && <div className="form-error">{profileError}</div>}
        <form onSubmit={handleProfileSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea
              value={profile.address}
              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
              rows={3}
            />
          </div>
          <button type="submit" className="btn btn-primary">Update Profile</button>
        </form>
      </section>

      <section className="profile-section">
        <h3>Change Password</h3>
        {passwordMessage && <div className="form-success">{passwordMessage}</div>}
        {passwordError && <div className="form-error">{passwordError}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={passwordData.current_password}
              onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={passwordData.password}
              onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={passwordData.password_confirmation}
              onChange={(e) => setPasswordData({ ...passwordData, password_confirmation: e.target.value })}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Change Password</button>
        </form>
      </section>
      </div>
    </div>
  );
}
