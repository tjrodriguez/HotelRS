import React from 'react';

const STATUS_MAP = {
  available: { label: 'Available', className: 'status-badge--available' },
  occupied: { label: 'Occupied', className: 'status-badge--occupied' },
  maintenance: { label: 'Maintenance', className: 'status-badge--maintenance' },
  reserved: { label: 'Reserved', className: 'status-badge--reserved' },
  pending: { label: 'Pending', className: 'status-badge--pending' },
  confirmed: { label: 'Confirmed', className: 'status-badge--confirmed' },
  cancelled: { label: 'Cancelled', className: 'status-badge--cancelled' },
  completed: { label: 'Completed', className: 'status-badge--completed' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_MAP[status?.toLowerCase()] || { label: status, className: 'status-badge--default' };

  return (
    <span className={`status-badge ${config.className}`}>
      {config.label}
    </span>
  );
}
