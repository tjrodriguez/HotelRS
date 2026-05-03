import React from 'react';

export default function ErrorDisplay({ message, onRetry }) {
  return (
    <div className="error-display" role="alert">
      <p className="error-display__message">{message}</p>
      {onRetry && (
        <button className="error-display__retry" onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  );
}
