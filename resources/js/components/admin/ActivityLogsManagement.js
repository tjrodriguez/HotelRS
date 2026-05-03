import React, { useState, useEffect, useMemo } from 'react';
import { apiClient } from '../../services/apiClient';
import DataTable from './DataTable';
import Modal from '../Modal';

export default function ActivityLogsManagement() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewLog, setViewLog] = useState(null);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.getActivityLogs();
      setLogs(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!search) return logs;
    const q = search.toLowerCase();
    return logs.filter((l) => {
      return (
        String(l.id).includes(q) ||
        String(l.user_id).includes(q) ||
        String(l.action || '').toLowerCase().includes(q) ||
        String(l.entity_type || '').toLowerCase().includes(q) ||
        String(l.entity_id || '').includes(q) ||
        String(l.created_at || '').toLowerCase().includes(q) ||
        JSON.stringify(l).toLowerCase().includes(q)
      );
    });
  }, [logs, search]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => { if (page > pageCount) setPage(1); }, [pageCount]);

  const columns = [
    { key: 'id', label: 'ID', align: 'right' },
    { key: 'user', label: 'User', render: (val, row) => (row.user ? row.user.name : row.user_id) },
    { key: 'action', label: 'Action', render: (val) => (val ? String(val).slice(0, 60) : '') },
    { key: 'entity_type', label: 'Entity Type' },
    { key: 'entity_id', label: 'Entity ID', align: 'right' },
    { key: 'created_at', label: 'Timestamp', render: (val) => (val ? new Date(val).toLocaleString() : '') },
  ];

  const handleView = (row) => setViewLog(row);

  return (
    <div className="management-container">
      <div className="management-header">
        <h2>Activity Logs</h2>
        <div className="table-filters">
          <input placeholder="Search logs..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
          <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <DataTable columns={columns} data={current} isLoading={isLoading} onEdit={handleView} />

      <div className="pagination">
        <div className="pagination-info">
          Showing {(filtered.length === 0) ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} of {filtered.length}
        </div>
        <div className="pagination-controls">
          <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</button>
          <span>Page {page} / {pageCount}</span>
          <button className="btn btn-sm" disabled={page >= pageCount} onClick={() => setPage((p) => Math.min(pageCount, p + 1))}>Next</button>
        </div>
      </div>

      {viewLog && (
        <Modal title={`Log #${viewLog.id}`} onClose={() => setViewLog(null)}>
          <div className="log-details">
            <div><strong>User:</strong> {viewLog.user ? viewLog.user.name : viewLog.user_id}</div>
            <div><strong>Action:</strong> {viewLog.action}</div>
            <div><strong>Entity:</strong> {viewLog.entity_type} #{viewLog.entity_id}</div>
            <div><strong>When:</strong> {viewLog.created_at ? new Date(viewLog.created_at).toLocaleString() : ''}</div>
            <div><strong>Details:</strong>
              <pre className="log-json">{JSON.stringify(viewLog.metadata || viewLog.data || viewLog, null, 2)}</pre>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
