import React, { useState, useEffect } from 'react';
import { getMedicalWasteAuditLogs } from '../services/medicalWasteAuditService';
import { AuditLog } from '../../../db/db';

export const WasteAuditLogsView: React.FC<{ isAdmin: boolean }> = ({ isAdmin }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await getMedicalWasteAuditLogs(150);
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedActionFilter !== 'ALL' && log.action !== selectedActionFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDetails = log.details?.toLowerCase().includes(q);
      const matchAction = log.action?.toLowerCase().includes(q);
      const matchUser = log.userName?.toLowerCase().includes(q);
      const matchRecord = String(log.recordId || '').toLowerCase().includes(q);
      return matchDetails || matchAction || matchUser || matchRecord;
    }
    return true;
  });

  if (!isAdmin) {
    return (
      <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center space-y-2">
        <span className="text-3xl">🔒</span>
        <h3 className="text-sm font-black text-slate-900">Administrator Access Required</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Complete medical waste audit trails and regulatory compliance manifests are restricted to authorized administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4 p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="text-base font-black text-slate-900 tracking-tight">
              Biomedical Waste Audit Trail &amp; Chain-of-Custody
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable, read-only legal audit log for environmental authority inspections (Tamil Nadu Pollution Control Board / CPCB).
          </p>
        </div>

        <button
          type="button"
          onClick={loadLogs}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
        >
          🔄 Refresh Logs
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by action, item ID, operator, or notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-slate-500 whitespace-nowrap">
            Action:
          </span>
          <select
            value={selectedActionFilter}
            onChange={(e) => setSelectedActionFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700"
          >
            <option value="ALL">All Actions</option>
            <option value="Waste scan created">Waste scan created</option>
            <option value="AI prediction generated">AI prediction generated</option>
            <option value="Manual review completed">Manual review completed</option>
            <option value="Prediction corrected">Prediction corrected</option>
            <option value="Collection created">Collection created</option>
            <option value="Pickup recorded">Pickup recorded</option>
            <option value="Transport status changed">Transport status changed</option>
            <option value="Waste received">Waste received</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading audit records...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500">
          No audit entries matching the search criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] border-b border-slate-200">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Action</th>
                <th className="p-3">Record ID</th>
                <th className="p-3">Operator</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.logId} className="hover:bg-slate-50/80">
                  <td className="p-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </td>
                  <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] border border-teal-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-xs font-bold text-slate-700">
                    {log.recordId || '—'}
                  </td>
                  <td className="p-3 text-slate-700 whitespace-nowrap">
                    <span className="font-medium">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 block capitalize">{log.userRole}</span>
                  </td>
                  <td className="p-3 text-slate-600 text-[11px] max-w-md break-words">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
