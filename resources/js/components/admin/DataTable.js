import React from 'react';

function SkeletonTable() {
  return (
    <div className="skeleton-table">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-cell" />
          <div className="skeleton-cell" />
          <div className="skeleton-cell" />
          <div className="skeleton-cell" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" width="48" height="48">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="9" y1="9" x2="15" y2="15" />
          <line x1="15" y1="9" x2="9" y2="15" />
        </svg>
      </div>
      <h4>No records found</h4>
      <p>There are no items to display at the moment. Add a new record to get started.</p>
    </div>
  );
}

export default function DataTable({ columns, data, isLoading, onEdit, onDelete, renderActions }) {
  if (isLoading) {
    return (
      <div className="table-wrapper">
        <SkeletonTable />
      </div>
    );
  }

  const rows = Array.isArray(data) ? data : data?.data || [];

  if (rows.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`col-${col.key} ${col.align === 'right' ? 'text-right' : ''}`}>{col.label}</th>
            ))}
            <th className="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id ?? idx}>
              {columns.map((col) => (
                <td key={col.key} className={`col-${col.key} ${col.align === 'right' ? 'text-right' : ''}`}>
                  {typeof col.render === 'function' ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              <td className="actions">
                {typeof renderActions === 'function' && renderActions(row)}
                {onEdit && (
                  <button onClick={() => onEdit(row)} className="btn-icon btn-edit" aria-label="Edit row" title="Edit">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                    </svg>
                  </button>
                )}
                {onDelete && (
                  <button onClick={() => onDelete(row)} className="btn-icon btn-delete" aria-label="Delete row" title="Delete">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
