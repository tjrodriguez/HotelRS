import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { apiClient } from '../services/apiClient';

function formatRelativeDate(value) {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  const elapsed = Math.floor((Date.now() - date.getTime()) / 1000);

  if (elapsed < 60) {
    return 'Just now';
  }

  const minutes = Math.floor(elapsed / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hr ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function NotificationGlyph({ type }) {
  const normalized = String(type || '').toLowerCase();

  if (normalized.includes('payment') || normalized.includes('wallet')) {
    return <span aria-hidden>$</span>;
  }

  if (normalized.includes('reservation')) {
    return <span aria-hidden>R</span>;
  }

  if (normalized.includes('alert')) {
    return <span aria-hidden>!</span>;
  }

  return <span aria-hidden>i</span>;
}

export default function Notifications({ userType = 'guest' }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );

  const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );

  const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await apiClient.getNotifications();
      const list = Array.isArray(data?.data) ? data.data : [];
      setNotifications(list);
      setUnreadCount(Number(data?.unread_count || 0));

      const latestWalletMeta = list
        .map((item) => item?.meta)
        .find((meta) => meta && typeof meta.wallet_balance !== 'undefined');

      if (latestWalletMeta) {
        window.dispatchEvent(new CustomEvent('wallet:updated', {
          detail: {
            balance: Number(latestWalletMeta.wallet_balance),
            serverMode: true,
          },
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 15000);
    return () => clearInterval(timer);
  }, [loadNotifications]);

  const handleMarkAsRead = (id) => {
    apiClient.markNotificationAsRead(id)
      .then(() => {
        setNotifications((prev) => prev.map((n) => (
          n.id === id ? { ...n, read_at: n.read_at || new Date().toISOString() } : n
        )));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      })
      .catch((error) => {
        console.error('Failed to mark notification as read:', error);
      });
  };

  const handleClearAll = () => {
    apiClient.markAllNotificationsAsRead()
      .then(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
        setUnreadCount(0);
      })
      .catch((error) => {
        console.error('Failed to mark all notifications as read:', error);
      });
  };

  const visibleNotifications = useMemo(
    () => notifications,
    [notifications],
  );

  return (
    <div className={`notifications-container notifications-${userType}`}>
      <button
        className="notifications-bell"
        onClick={() => {
          setShowDropdown(!showDropdown);
          if (!showDropdown) {
            loadNotifications();
          }
        }}
        aria-label="View notifications"
        title={`${userType === 'admin' ? 'Admin' : 'Guest'} notifications`}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="notifications-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>{userType === 'admin' ? 'Admin Notifications' : 'Guest Notifications'}</h3>
            {visibleNotifications.length > 0 && (
              <button
                className="notifications-clear"
                onClick={handleClearAll}
                type="button"
                title="Clear all notifications"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notifications-list">
            {isLoading ? (
              <div className="notifications-empty">
                <p>Loading notifications...</p>
              </div>
            ) : visibleNotifications.length === 0 ? (
              <div className="notifications-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.5">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                <p>All caught up!</p>
              </div>
            ) : (
              visibleNotifications.map((notif) => (
                <div key={notif.id} className={`notification-item ${notif.read_at ? 'read' : 'unread'}`}>
                  <div className="notification-icon"><NotificationGlyph type={notif.type} /></div>
                  <div className="notification-content">
                    <p className="notification-title">{notif.title || 'Notification'}</p>
                    <p className="notification-message">{notif.message}</p>
                    <span className="notification-time">{formatRelativeDate(notif.created_at)}</span>
                  </div>
                  <div className="notification-actions">
                    {!notif.read_at && (
                      <button
                        className="notification-markread"
                        onClick={() => handleMarkAsRead(notif.id)}
                        type="button"
                        aria-label="Mark as read"
                        title="Mark as read"
                      >
                        <CheckIcon />
                      </button>
                    )}
                    <button
                      className="notification-close"
                      onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id))}
                      type="button"
                      aria-label="Dismiss notification"
                      title="Dismiss"
                    >
                      <CloseIcon />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="notifications-footer">
            <button type="button" className="notifications-link" onClick={loadNotifications}>Refresh</button>
          </div>
        </div>
      )}

      {showDropdown && (
        <div
          className="notifications-backdrop"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
