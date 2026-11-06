import React, { useEffect, useState } from 'react';
import { History, AlertCircle, RefreshCw, Zap, ArrowLeft, Shield } from 'lucide-react';
import { ActivityLogEntry } from '../types';
import { fetchActivity } from '../api';

interface ActivityLogViewProps {
  onBack: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchActivity();
      setLogs(data.activity);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl transition-colors shadow-2xs"
            title="Back to Disputes"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <History className="w-5 h-5 text-blue-600" />
              <span>Merchant Audit Trail & Activity Log</span>
            </h2>
            <p className="text-xs text-slate-500">
              Immutable log of merchant approvals, evidence submissions, and settlement offers
            </p>
          </div>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Audit Log</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading audit trail...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 mx-auto mb-1" />
          <p>{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          <Shield className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-semibold text-sm text-slate-800">No actions recorded yet</p>
          <p className="text-xs text-slate-400 mt-1">
            When you approve evidence or take settlement actions on disputes, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {logs.map((log) => (
              <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-xs text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded">
                      {log.disputeId}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                        log.action === 'submit-evidence'
                          ? 'bg-blue-100 text-blue-800'
                          : log.action === 'accept'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.action.replace('-', ' ')}
                    </span>
                    {log.dryRun && (
                      <span className="text-[11px] bg-violet-100 text-violet-700 px-2 py-0.2 rounded-full font-semibold flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-violet-600" />
                        <span>DRY RUN</span>
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>

                {log.payload && (
                  <div className="mt-2 bg-slate-900 text-slate-200 p-3 rounded-xl font-mono text-[11px] overflow-x-auto">
                    <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
