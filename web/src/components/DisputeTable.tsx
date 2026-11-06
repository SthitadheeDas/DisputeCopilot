import React from 'react';
import {
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Package,
  User,
} from 'lucide-react';
import { EnrichedDispute, ScoreBand } from '../types';

interface DisputeTableProps {
  disputes: EnrichedDispute[];
  onSelectDispute: (dispute: EnrichedDispute) => void;
}

export const DisputeTable: React.FC<DisputeTableProps> = ({
  disputes,
  onSelectDispute,
}) => {
  // Format live deadline countdown
  const renderDeadlineBadge = (hoursRemaining: number, dueDateStr: string) => {
    const isUrgent = hoursRemaining <= 48;
    const isOverdue = hoursRemaining <= 0;

    const days = Math.floor(hoursRemaining / 24);
    const hours = hoursRemaining % 24;

    let timeLabel = '';
    if (isOverdue) {
      timeLabel = 'Overdue';
    } else if (days > 0) {
      timeLabel = `${days}d ${hours}h remaining`;
    } else {
      timeLabel = `${hours}h remaining`;
    }

    const formattedDate = new Date(dueDateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    if (isUrgent) {
      return (
        <div>
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>{timeLabel}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">{formattedDate}</div>
        </div>
      );
    }

    return (
      <div>
        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-slate-500" />
          <span>{timeLabel}</span>
        </div>
        <div className="text-[11px] text-slate-500 mt-0.5">{formattedDate}</div>
      </div>
    );
  };

  // Format evidence strength badge
  const renderStrengthBadge = (band: ScoreBand, score: number) => {
    switch (band) {
      case 'strong':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strong ({score}/100)</span>
          </span>
        );
      case 'medium':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>Medium ({score}/100)</span>
          </span>
        );
      case 'weak':
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Weak ({score}/100)</span>
          </span>
        );
    }
  };

  const formatReason = (reason: string) => {
    if (
      reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED' ||
      reason === 'ITEM_NOT_RECEIVED'
    ) {
      return {
        label: 'Item Not Received',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    }
    if (
      reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED' ||
      reason === 'NOT_AS_DESCRIBED'
    ) {
      return {
        label: 'Not As Described',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
      };
    }
    return {
      label: reason,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Active Payment Disputes ({disputes.length})
          </h3>
          <p className="text-xs text-slate-500">
            Sorted by seller response deadline (soonest deadline first)
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Click any dispute to inspect evidence & draft response
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50 text-slate-700 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th scope="col" className="px-6 py-3.5">Dispute & Customer</th>
              <th scope="col" className="px-6 py-3.5">Dispute Reason</th>
              <th scope="col" className="px-6 py-3.5">Amount at Stake</th>
              <th scope="col" className="px-6 py-3.5">Evidence Strength</th>
              <th scope="col" className="px-6 py-3.5">Response Deadline</th>
              <th scope="col" className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {disputes.map((dispute) => {
              const reasonMeta = formatReason(dispute.reason);
              const customerName =
                dispute.matchedOrder?.customerName ||
                dispute.disputed_transactions?.[0]?.buyer?.name ||
                'Anonymous Buyer';

              return (
                <tr
                  key={dispute.dispute_id}
                  onClick={() => onSelectDispute(dispute)}
                  className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                >
                  {/* Dispute & Customer */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-blue-100 text-slate-600 group-hover:text-blue-700 flex items-center justify-center transition-colors">
                        <Package className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {dispute.dispute_id}
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-slate-500">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{customerName}</span>
                          {dispute.matchedOrder && (
                            <span className="text-[11px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-mono">
                              {dispute.matchedOrder.orderId}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Reason */}
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${reasonMeta.badgeClass}`}
                    >
                      {reasonMeta.label}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-1 capitalize">
                      {dispute.status.toLowerCase().replace(/_/g, ' ')}
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 text-base">
                      ${parseFloat(dispute.dispute_amount.value).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {dispute.dispute_amount.currency_code}
                    </div>
                  </td>

                  {/* Evidence Strength */}
                  <td className="px-6 py-4">
                    {renderStrengthBadge(dispute.score.band, dispute.score.totalScore)}
                    <div className="text-[11px] text-slate-400 mt-1">
                      {dispute.score.breakdown.filter((b) => b.passed).length}/
                      {dispute.score.breakdown.length} criteria met
                    </div>
                  </td>

                  {/* Response Deadline */}
                  <td className="px-6 py-4">
                    {renderDeadlineBadge(
                      dispute.hoursRemaining,
                      dispute.seller_response_due_date
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDispute(dispute);
                      }}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 transition-all border border-blue-200 hover:border-transparent shadow-2xs"
                    >
                      <span>Review & Defend</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
