import React, { useMemo, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  RowClickedEvent,
} from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import {
  TrendingUp,
  DollarSign,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { EnrichedDispute } from '../types';

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface AnalyticsTabProps {
  disputes: EnrichedDispute[];
  onSelectDispute: (dispute: EnrichedDispute) => void;
}

interface AnalyticsRowData {
  disputeId: string;
  customer: string;
  orderId: string;
  reason: string;
  reasonRaw: string;
  amount: number;
  currency: string;
  score: number;
  band: 'strong' | 'medium' | 'weak';
  strategy: 'FIGHT' | 'ACCEPT' | 'SETTLE';
  recoverable: number;
  hoursRemaining: number;
  dueDate: string;
  rawDispute: EnrichedDispute;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  disputes,
  onSelectDispute,
}) => {
  const [quickFilterText, setQuickFilterText] = useState<string>('');

  // Transform disputes into analytical rows
  const rowData: AnalyticsRowData[] = useMemo(() => {
    return disputes.map((d) => {
      const amount = parseFloat(d.dispute_amount?.value || '0');
      const score = d.score.totalScore;
      const band = d.score.band;

      let strategy: 'FIGHT' | 'ACCEPT' | 'SETTLE' = 'FIGHT';
      const aiRec = d.cachedAnalysis?.recommendation;

      if (aiRec === 'fight') strategy = 'FIGHT';
      else if (aiRec === 'accept') strategy = 'ACCEPT';
      else if (aiRec === 'partial_offer') strategy = 'SETTLE';
      else if (score >= 70) strategy = 'FIGHT';
      else if (score >= 40) strategy = 'SETTLE';
      else strategy = 'ACCEPT';

      // Estimated Recoverable Revenue calculation:
      // FIGHT: 100% of amount expected retained under seller protection
      // SETTLE: ~60% retained (assuming ~40% partial refund concession)
      // ACCEPT: $0 retained (conceded)
      let recoverable = 0;
      if (strategy === 'FIGHT') {
        recoverable = amount;
      } else if (strategy === 'SETTLE') {
        const offerAmt = d.cachedAnalysis?.recommendedOfferAmount ?? amount * 0.4;
        recoverable = Math.max(0, amount - offerAmt);
      } else {
        recoverable = 0;
      }

      let reasonLabel = d.reason;
      if (
        d.reason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED' ||
        d.reason === 'ITEM_NOT_RECEIVED'
      ) {
        reasonLabel = 'Item Not Received';
      } else if (
        d.reason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED' ||
        d.reason === 'NOT_AS_DESCRIBED'
      ) {
        reasonLabel = 'Not As Described';
      }

      const customer =
        d.matchedOrder?.customerName ||
        d.disputed_transactions?.[0]?.buyer?.name ||
        'Customer';

      const orderId = d.matchedOrder?.orderId || 'Unlinked';

      const dueDate = new Date(d.seller_response_due_date).toLocaleDateString(
        undefined,
        { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      );

      return {
        disputeId: d.dispute_id,
        customer,
        orderId,
        reason: reasonLabel,
        reasonRaw: d.reason,
        amount,
        currency: d.dispute_amount.currency_code || 'USD',
        score,
        band,
        strategy,
        recoverable: Math.round(recoverable * 100) / 100,
        hoursRemaining: d.hoursRemaining,
        dueDate,
        rawDispute: d,
      };
    });
  }, [disputes]);

  // Aggregate Metrics
  const totalAtStake = useMemo(
    () => rowData.reduce((sum, r) => sum + r.amount, 0),
    [rowData]
  );

  const estimatedRecoverable = useMemo(
    () => rowData.reduce((sum, r) => sum + r.recoverable, 0),
    [rowData]
  );

  const fightCount = useMemo(
    () => rowData.filter((r) => r.strategy === 'FIGHT').length,
    [rowData]
  );

  const recoveryRate = useMemo(() => {
    if (totalAtStake === 0) return 0;
    return Math.round((estimatedRecoverable / totalAtStake) * 100);
  }, [totalAtStake, estimatedRecoverable]);

  // AG Grid Column Definitions
  const columnDefs: ColDef<AnalyticsRowData>[] = useMemo(() => {
    return [
      {
        headerName: 'Dispute ID',
        field: 'disputeId',
        width: 155,
        pinned: 'left',
        cellRenderer: (params: { value: string; data?: AnalyticsRowData }) => {
          return (
            <div className="flex items-center space-x-1 font-mono font-bold text-blue-600 hover:text-blue-800 cursor-pointer">
              <span>{params.value}</span>
            </div>
          );
        },
      },
      {
        headerName: 'Customer',
        field: 'customer',
        width: 170,
        cellRenderer: (params: { value: string; data?: AnalyticsRowData }) => {
          return (
            <div>
              <div className="font-semibold text-slate-900 leading-tight">
                {params.value}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                {params.data?.orderId}
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Reason',
        field: 'reason',
        width: 175,
        cellRenderer: (params: { value: string }) => {
          const isINR = params.value.includes('Not Received');
          return (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                isINR
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-purple-50 text-purple-700 border-purple-200'
              }`}
            >
              {params.value}
            </span>
          );
        },
      },
      {
        headerName: 'Amount',
        field: 'amount',
        width: 130,
        valueFormatter: (params) =>
          `$${(params.value as number).toFixed(2)} ${params.data?.currency || 'USD'}`,
        cellClass: 'font-bold text-slate-900',
      },
      {
        headerName: 'Winnability Score',
        field: 'score',
        width: 165,
        cellRenderer: (params: { value: number; data?: AnalyticsRowData }) => {
          const score = params.value;
          let barColor = 'bg-rose-500';
          if (score >= 70) barColor = 'bg-emerald-500';
          else if (score >= 40) barColor = 'bg-amber-500';

          return (
            <div className="flex items-center space-x-2 w-full pt-1.5">
              <div className="w-12 text-xs font-bold text-slate-900">
                {score}/100
              </div>
              <div className="flex-1 bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor}`}
                  style={{ width: `${Math.min(100, score)}%` }}
                />
              </div>
            </div>
          );
        },
      },
      {
        headerName: 'Risk Band',
        field: 'band',
        width: 135,
        cellRenderer: (params: { value: 'strong' | 'medium' | 'weak' }) => {
          if (params.value === 'strong') {
            return (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span>Low Risk</span>
              </span>
            );
          }
          if (params.value === 'medium') {
            return (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <span>Med Risk</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <span>High Risk</span>
            </span>
          );
        },
      },
      {
        headerName: 'Strategy',
        field: 'strategy',
        width: 140,
        cellRenderer: (params: { value: 'FIGHT' | 'ACCEPT' | 'SETTLE' }) => {
          if (params.value === 'FIGHT') {
            return (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>FIGHT</span>
              </span>
            );
          }
          if (params.value === 'SETTLE') {
            return (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-300">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SETTLE</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
              <span>ACCEPT</span>
            </span>
          );
        },
      },
      {
        headerName: 'Recoverable ($)',
        field: 'recoverable',
        width: 155,
        cellRenderer: (params: { value: number; data?: AnalyticsRowData }) => {
          const val = params.value;
          const isZero = val === 0;
          return (
            <div className="pt-0.5">
              <span
                className={`font-black text-sm ${
                  isZero ? 'text-slate-400' : 'text-emerald-600'
                }`}
              >
                ${val.toFixed(2)}
              </span>
              <span className="text-[11px] text-slate-400 ml-1">
                {params.data?.currency || 'USD'}
              </span>
            </div>
          );
        },
      },
      {
        headerName: 'Response Due',
        field: 'dueDate',
        width: 175,
        cellRenderer: (params: { value: string; data?: AnalyticsRowData }) => {
          const hours = params.data?.hoursRemaining ?? 0;
          const isUrgent = hours <= 48;
          return (
            <div className="pt-0.5">
              <div
                className={`inline-flex items-center space-x-1 text-xs font-semibold ${
                  isUrgent ? 'text-rose-600 font-bold' : 'text-slate-700'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {hours > 0 ? `${hours}h left` : 'Expired'}
                </span>
              </div>
              <div className="text-[11px] text-slate-400">{params.value}</div>
            </div>
          );
        },
      },
      {
        headerName: 'Action',
        width: 120,
        pinned: 'right',
        cellRenderer: (params: { data?: AnalyticsRowData }) => {
          return (
            <button
              onClick={() => {
                if (params.data?.rawDispute) {
                  onSelectDispute(params.data.rawDispute);
                }
              }}
              className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
            >
              <span>Review</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          );
        },
      },
    ];
  }, [onSelectDispute]);

  const onRowClicked = (event: RowClickedEvent<AnalyticsRowData>) => {
    if (event.data?.rawDispute) {
      onSelectDispute(event.data.rawDispute);
    }
  };

  return (
    <div className="space-y-6">
      {/* Analytics KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total at Stake */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Total Amount at Stake
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            ${totalAtStake.toFixed(2)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across {disputes.length} active customer claims
          </div>
        </div>

        {/* Estimated Recoverable Revenue */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white p-5 rounded-2xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Estimated Recoverable
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 tracking-tight">
            ${estimatedRecoverable.toFixed(2)}
          </div>
          <div className="text-xs text-emerald-800 font-semibold mt-1">
            {recoveryRate}% projected recovery rate
          </div>
        </div>

        {/* Defensible Disputes Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              Defensible (FIGHT)
            </span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-indigo-700 tracking-tight">
            {fightCount}{' '}
            <span className="text-lg text-slate-400 font-normal">
              / {disputes.length}
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Strong rubric proof (&ge; 70 pts)
          </div>
        </div>

        {/* AI Copilot Status Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">
              AI Strategy Engine
            </span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            Automated Strategy
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Deterministic scoring + Grounded Gemini defense
          </div>
        </div>
      </div>

      {/* Grid Container Card */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
        {/* Grid Title & Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Dispute Analytics Matrix (AG Grid)
            </h3>
            <p className="text-xs text-slate-500">
              Sort, filter, and analyze recovery potential across all disputed orders
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              placeholder="Filter disputes, customers..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden transition-all text-slate-800"
            />
          </div>
        </div>

        {/* AG Grid React Table */}
        <div
          className="ag-theme-quartz w-full rounded-xl overflow-hidden border border-slate-200"
          style={{ height: '480px' }}
        >
          <AgGridReact<AnalyticsRowData>
            rowData={rowData}
            columnDefs={columnDefs}
            quickFilterText={quickFilterText}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50]}
            rowHeight={52}
            headerHeight={44}
            onRowClicked={onRowClicked}
            defaultColDef={{
              sortable: true,
              filter: true,
              resizable: true,
            }}
          />
        </div>

        <div className="text-xs text-slate-400 text-right">
          Tip: Click any row to open the complete Evidence Pack & Response Drafter
        </div>
      </div>
    </div>
  );
};
export default AnalyticsTab;
