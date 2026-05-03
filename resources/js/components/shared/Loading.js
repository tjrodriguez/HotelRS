import React from 'react';

export default function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <div className="loading__spinner" aria-hidden="true" />
      <span className="loading__text">{message}</span>
    </div>
  );
}
