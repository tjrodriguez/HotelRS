import React from 'react';

export default function DataTable({ columns, data, isLoading, onEdit, onDelete }) {
  if (isLoading) return <div className="table-loading">Loading...</div>;

  const rows = Array.isArray(data) ? data : data?.data || [];

  if (rows.length === 0) {
    return <div className="table-empty">No records found</div>;
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={`col-${col.key}`}>{col.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.id ?? idx}>
              {columns.map((col) => (
                <td key={col.key} className={`col-${col.key}`}>
                  {typeof col.render === 'function' ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
              <td className="actions">
                {onEdit && <button onClick={() => onEdit(row)} className="btn-icon btn-edit">✏️</button>}
                {onDelete && <button onClick={() => onDelete(row)} className="btn-icon btn-delete">🗑️</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
