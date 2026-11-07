import React, { useEffect, useState } from 'react';
import {
  History,
  AlertCircle,
  RefreshCw,
  Zap,
  ArrowLeft,
  Shield,
  FileText,
  CheckCircle2,
  DollarSign,
  Send,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
} from 'lucide-react';
import { ActivityLogEntry } from '../types';
import { fetchActivity } from '../api';

interface ActivityLogViewProps {
  onBack: () => void;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ onBack }) => {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPayloadIds, setExpandedPayloadIds] = useState<Set<string>>(new Set());

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

  const togglePayload = (id: string) => {
    setExpandedPayloadIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Helper to extract clean human-readable details from log payload
  const parseActivityDetails = (log: ActivityLogEntry) => {
    const payload = log.payload as Record<string, unknown> | undefined;

    if (log.action === 'submit-evidence') {
      const evidences = payload?.evidences as Array<{ evidence_type?: string; notes?: string }> | undefined;
      const firstEv = evidences?.[0];
      const notes = firstEv?.notes || (typeof payload?.notes === 'string' ? payload.notes : 'Evidence submitted.');
      const evidenceType = firstEv?.evidence_type || 'OTHER';

      return {
        actionLabel: 'Evidence Submitted',
        actionColor: 'bg-blue-100 text-blue-800 border-blue-200',
        badgeBg: 'bg-blue-50 text-blue-600 border-blue-200',
        icon: Send,
        primaryNote: notes,
        subMeta: `Evidence Type: ${evidenceType}`,
        amount: null,
      };
    }

    if (log.action === 'accept') {
      const note = typeof payload?.note === 'string' ? payload.note : 'Merchant accepted customer claim.';

      return {
        actionLabel: 'Claim Accepted',
        actionColor: 'bg-rose-100 text-rose-800 border-rose-200',
        badgeBg: 'bg-rose-50 text-rose-600 border-rose-200',
        icon: CheckCircle2,
        primaryNote: note,
        subMeta: 'Merchant conceded liability and authorized full customer refund',
        amount: null,
      };
    }

    if (log.action === 'offer') {
      const note = typeof payload?.note === 'string' ? payload.note : 'Settlement refund proposed by merchant.';
      const offerAmount = payload?.offer_amount as { currency_code?: string; value?: string } | undefined;
      const amountStr = offerAmount?.value
        ? `$${parseFloat(offerAmount.value).toFixed(2)} ${offerAmount.currency_code || 'USD'}`
        : null;

      return {
        actionLabel: 'Settlement Offer',
        actionColor: 'bg-amber-100 text-amber-800 border-amber-200',
        badgeBg: 'bg-amber-50 text-amber-600 border-amber-200',
        icon: DollarSign,
        primaryNote: note,
        subMeta: amountStr ? `Proposed settlement amount: ${amountStr}` : 'Partial settlement proposal',
        amount: amountStr,
      };
    }

    return {
      actionLabel: log.action,
      actionColor: 'bg-slate-100 text-slate-800 border-slate-200',
      badgeBg: 'bg-slate-50 text-slate-600 border-slate-200',
      icon: FileText,
      primaryNote: JSON.stringify(payload || {}),
      subMeta: null,
      amount: null,
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <p className="text-xs text-slate-500 mt-0.5">
              Chronological log of verified merchant decisions, evidence packs, and claim settlements
            </p>
          </div>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs flex items-center space-x-1.5 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600' : ''}`} />
          <span>Refresh Audit Log</span>
        </button>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800 text-sm">Loading audit trail...</h4>
          <p className="text-xs text-slate-400 mt-1">
            Fetching chronological merchant action history
          </p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 text-xs">
          <AlertCircle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
          <h4 className="font-bold text-sm">Error Loading Log</h4>
          <p className="mt-1">{error}</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500">
          <Shield className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="font-bold text-base text-slate-800">No Merchant Actions Recorded Yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            When you approve and submit evidence, accept claims, or propose partial refunds on disputes, a verified activity record will be logged here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => {
            const details = parseActivityDetails(log);
            const IconComponent = details.icon;
            const isRawExpanded = expandedPayloadIds.has(log.id);
            const formattedDate = new Date(log.timestamp).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            });

            return (
              <div
                key={log.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition-all space-y-4"
              >
                {/* Activity Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Action Icon */}
                    <div className={`p-2 rounded-xl border ${details.badgeBg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Dispute ID Badge */}
                    <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                      <span>{log.disputeId}</span>
                    </div>

                    {/* Action Type Badge */}
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${details.actionColor}`}
                    >
                      {details.actionLabel}
                    </span>

                    {/* Dry Run Badge */}
                    {log.dryRun && (
                      <span className="text-xs bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1">
                        <Zap className="w-3 h-3 text-violet-600" />
                        <span>DRY RUN</span>
                      </span>
                    )}

                    {/* Settlement Amount Badge if Offer */}
                    {details.amount && (
                      <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        Offer: {details.amount}
                      </span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                {/* Activity Card Content Body */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
                    <span>
                      {log.action === 'submit-evidence'
                        ? 'Evidence Defense Statement'
                        : log.action === 'offer'
                        ? 'Settlement Offer Note'
                        : 'Merchant Decision Note'}
                    </span>
                    {details.subMeta && (
                      <span className="text-[11px] text-slate-400 font-mono">
                        {details.subMeta}
                      </span>
                    )}
                  </div>

                  {/* Human-Readable Statement Box with clean whitespace preservation */}
                  <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-line shadow-2xs">
                    {details.primaryNote}
                  </div>
                </div>

                {/* Footer bar with optional payload expansion */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="text-[11px] text-slate-400 font-mono">
                    Audit ID: {log.id}
                  </div>

                  {log.payload && (
                    <button
                      onClick={() => togglePayload(log.id)}
                      className="inline-flex items-center space-x-1 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors py-1 px-2 rounded-lg hover:bg-slate-100"
                    >
                      <Code2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{isRawExpanded ? 'Hide Raw Payload' : 'View Raw Payload'}</span>
                      {isRawExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Collapsible Raw JSON Block (Clean, optional developer inspector) */}
                {isRawExpanded && log.payload && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="text-[11px] text-slate-500 font-semibold mb-1 flex items-center justify-between">
                      <span>Transmitted API Payload (JSON)</span>
                      <span className="text-[10px] text-slate-400">Read-only capture</span>
                    </div>
                    <div className="bg-slate-900 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-x-auto shadow-inner">
                      <pre>{JSON.stringify(log.payload, null, 2)}</pre>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
