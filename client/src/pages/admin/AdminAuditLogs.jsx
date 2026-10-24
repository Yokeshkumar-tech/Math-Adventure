// client/src/pages/admin/AdminAuditLogs.jsx
import React, { useState, useEffect } from "react";
import {
  History,
  Shield,
  Search,
  Filter,
  RefreshCw,
  User,
  Clock,
  FileText,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { adminAudit } from "../../services/adminApi.js";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchLogs = async (pageNum = 1) => {
    try {
      setLoading(true);
      const res = await adminAudit.list({
        page: pageNum,
        limit: 20,
        action: actionFilter !== "all" ? actionFilter : undefined,
        search: search.trim() || undefined,
      });

      setLogs(res.logs || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.total || 0);
      setPage(pageNum);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load audit records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [actionFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchLogs(1);
  };

  const getActionBadge = (action) => {
    if (!action) return "bg-slate-800 text-slate-300 border-slate-700";
    if (action.includes("SUSPEND") || action.includes("DELETE") || action.includes("RESET")) {
      return "bg-rose-500/20 text-rose-300 border-rose-500/30";
    }
    if (action.includes("PUBLISH") || action.includes("CREATE")) {
      return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    }
    if (action.includes("LOGIN") || action.includes("AUTH")) {
      return "bg-purple-500/20 text-purple-300 border-purple-500/30";
    }
    if (action.includes("UPDATE") || action.includes("ECONOMY")) {
      return "bg-amber-500/20 text-amber-300 border-amber-500/30";
    }
    return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white font-fredoka">Security & Audit Logs</h1>
            <p className="text-xs text-slate-400">
              Immutable ledger of administrative actions, authentication events, content changes, and student account modifications
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchLogs(page)}
          className="admin-btn admin-btn-secondary flex items-center gap-2 text-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search actor username, resource ID, or summary..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-input pl-10 w-full"
          />
        </form>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="admin-select w-full sm:w-48 text-xs"
          >
            <option value="all">All Action Types</option>
            <option value="LOGIN">Admin Login</option>
            <option value="CREATE_QUESTION">Create Question</option>
            <option value="PUBLISH_QUESTION">Publish Question</option>
            <option value="UPDATE_QUESTION">Update Question</option>
            <option value="DELETE_QUESTION">Delete Question</option>
            <option value="SUSPEND_PLAYER">Suspend Player</option>
            <option value="RESET_PROGRESS">Reset Player Progress</option>
            <option value="UPDATE_ECONOMY">Update Economy</option>
            <option value="CREATE_REALM">Create Realm</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading && logs.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-medium">
            Loading security audit log...
          </div>
        ) : error ? (
          <div className="p-6 bg-rose-500/10 border-b border-rose-500/20 text-rose-400 text-sm">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 p-8">
            <Shield className="w-12 h-12 mx-auto text-slate-600 mb-3" />
            <p className="text-slate-300 font-bold mb-1">No Audit Records Found</p>
            <p className="text-xs text-slate-500">
              Admin operations will automatically record to this ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="admin-table w-full text-left">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Resource Target</th>
                  <th>Change Summary & Reason</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition">
                    <td className="whitespace-nowrap text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] font-bold">
                          {log.actor?.username?.[0]?.toUpperCase() || "A"}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">
                            {log.actor?.username || "System Admin"}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {log.actor?.email || log.actor?.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="whitespace-nowrap">
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="whitespace-nowrap text-xs text-slate-300">
                      {log.resourceType ? (
                        <div className="font-mono text-[11px]">
                          <span className="text-slate-500">{log.resourceType}: </span>
                          <span className="text-indigo-400">
                            {log.resourceId ? String(log.resourceId).slice(-6) : "N/A"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>

                    <td className="text-xs text-slate-300 max-w-md">
                      <p className="leading-snug">{log.changeSummary || "Administrative action executed."}</p>
                      {log.reason && (
                        <p className="text-[10px] text-amber-400/90 mt-0.5">
                          <strong>Reason:</strong> {log.reason}
                        </p>
                      )}
                    </td>

                    <td className="whitespace-nowrap text-[11px] font-mono text-slate-400">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing page {page} of {totalPages} ({totalCount} total audit records)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => fetchLogs(page - 1)}
              className="admin-btn admin-btn-secondary text-xs px-3 py-1 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => fetchLogs(page + 1)}
              className="admin-btn admin-btn-secondary text-xs px-3 py-1 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
