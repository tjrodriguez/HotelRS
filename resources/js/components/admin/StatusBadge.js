import React from 'react';

const STATUS_CONFIG = {
  available: { cls: 'status-available', dot: '#10b981' },
  vacant: { cls: 'status-available', dot: '#10b981' },
  occupied: { cls: 'status-occupied', dot: '#ef4444' },
  pending: { cls: 'status-pending', dot: '#f59e0b' },
  confirmed: { cls: 'status-confirmed', dot: '#10b981' },
  completed: { cls: 'status-completed', dot: '#6b7280' },
  cancelled: { cls: 'status-cancelled', dot: '#ef4444' },
  declined: { cls: 'status-cancelled', dot: '#ef4444' },
  expired: { cls: 'status-expired', dot: '#ef4444' },
  active: { cls: 'status-confirmed', dot: '#10b981' },
  inactive: { cls: 'status-default', dot: '#9ca3af' },
  upcoming: { cls: 'status-pending', dot: '#f59e0b' },
  failed: { cls: 'status-cancelled', dot: '#ef4444' },
  default: { cls: 'status-default', dot: '#9ca3af' },
};

export default function StatusBadge({ status, label, className = '' }) {
  const key = (status || '').toLowerCase();
  const config = STATUS_CONFIG[key] || STATUS_CONFIG.default;
  const displayLabel = label || status || 'Unknown';

  return (
    <span className={`table-status ${config.cls} ${className}`}>
      <span className="dot" aria-hidden="true" />
      <span className="status-label">{displayLabel}</span>
    </span>
  );
}
