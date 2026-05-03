import React from 'react';

export default function EmptyState({ message = 'No items found.', action }) {
  return (
    <div className="empty-state">
      <p className="empty-state__message">{message}</p>
      {action}
    </div>
  );
}
