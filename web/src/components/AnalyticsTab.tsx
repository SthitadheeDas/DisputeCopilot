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
  DollarSign,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Percent,
  Clock,
  Search,
  ArrowRight,
  Sparkles,
  Wallet,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { EnrichedDispute } from '../types';
import { LIFETIME_CLEAN_TRANSACTIONS } from '../data/lifetimeTransactions';

// Register AG Grid Community Modules
ModuleRegistry.registerModules([AllCommunityModule]);

interface AnalyticsTabProps {
  disputes: EnrichedDispute[];
  onSelectDispute: (dispute: EnrichedDispute) => void;
}

export type TransactionFilterMode = 'all' | 'clean' | 'disputed';

export interface UnifiedTransactionRow {
  transactionId: string;
  orderId: string;
  date: string;
  dateFormatted: string;
  customer: string;
  itemDescription?: string;
  grossAmount: number;
  currency: string;
  paymentChannel: 'PayPal';
  disputeStatus: 'Clean' | 'Active' | 'Won' | 'Lost';
  // Disputed Extra P&L Fields
  disputeId?: string;
  stakeAmount?: number;
  actionTaken?: 'Fought via Gemini' | 'Conceded' | 'Settled';
  moneyGained?: number;
  moneyLost?: number;
  netImpact?: number;
  rawDispute?: EnrichedDispute;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  disputes,
  onSelectDispute,
}) => {
  const [filterMode, setFilterMode] = useState<TransactionFilterMode>('all');
  const [quickFilterText, setQuickFilterText] = useState<string>('');

  // 1. Map disputed transactions from live/fixture disputes
  const disputedRows: UnifiedTransactionRow[] = useMemo(() => {
    return disputes.map((d) => {
      const stake = parseFloat(d.dispute_amount?.value || '0');
      const currency = d.dispute_amount?.currency_code || 'USD';
      const score = d.score.totalScore;
      const aiRec = d.cachedAnalysis?.recommendation;

      // Standard PayPal chargeback/dispute fee is $15.00
      const PAYPAL_DISPUTE_FEE = 15.0;

      let actionTaken: 'Fought via Gemini' | 'Conceded' | 'Settled' = 'Fought via Gemini';
      let disputeStatus: 'Clean' | 'Active' | 'Won' | 'Lost' = 'Won';
      let moneyGained = 0;
      let moneyLost = 0;

      if (aiRec === 'accept' || (!aiRec && score < 40)) {
        // Conceded / Accepted claim: Merchant forfeits stake amount + PayPal dispute fee
        actionTaken = 'Conceded';
        disputeStatus = 'Lost';
        moneyGained = 0;
        moneyLost = stake + PAYPAL_DISPUTE_FEE;
      } else if (
        aiRec === 'partial_offer' ||
        (!aiRec && score >= 40 && score < 70 && (d.matchedOrder?.refunds?.length ?? 0) > 0)
      ) {
        // Settled claim: Retained original amount minus negotiated partial offer
        actionTaken = 'Settled';
        disputeStatus = 'Won';
        const offer =
          d.cachedAnalysis?.recommendedOfferAmount ??
          (d.matchedOrder?.refunds?.[0]?.amount ?? 50.0);
        moneyLost = offer;
        moneyGained = Math.max(0, stake - offer);
      } else {
        // Fought via Gemini: 100% retained under PayPal Seller Protection, dispute fee waived
        actionTaken = 'Fought via Gemini';
        disputeStatus = d.status === 'RESOLVED' || score >= 70 ? 'Won' : 'Active';
        moneyGained = stake;
        moneyLost = 0;
      }

      const netImpact = moneyGained - moneyLost;

      const rawTxId = d.disputed_transactions?.[0]?.seller_transaction_id;
      const cleanTxId =
        rawTxId && !rawTxId.startsWith('REPLACE')
          ? rawTxId
          : `TXN-88${d.dispute_id.replace(/[^0-9]/g, '').slice(-4) || '1001'}`;

      const dateRaw = d.matchedOrder?.orderedAt || d.create_time;
      const dateFormatted = new Date(dateRaw).toUTCString();

      const customer =
        d.matchedOrder?.customerName ||
        d.disputed_transactions?.[0]?.buyer?.name ||
        'Customer';

      const orderId =
        d.matchedOrder?.orderId || `ORD-${d.dispute_id.replace('PP-D-', '')}`;

      const itemDesc =
        d.matchedOrder?.items?.[0]?.name ||
        d.disputed_transactions?.[0]?.items?.[0]?.item_name ||
        'Merchant Order';

      return {
        transactionId: cleanTxId,
        orderId,
        date: dateRaw,
        dateFormatted,
        customer,
        itemDescription: itemDesc,
        grossAmount: d.matchedOrder?.amount || stake,
        currency,
        paymentChannel: 'PayPal' as const,
        disputeStatus,
        disputeId: d.dispute_id,
        stakeAmount: stake,
        actionTaken,
        moneyGained: Math.round(moneyGained * 100) / 100,
        moneyLost: Math.round(moneyLost * 100) / 100,
        netImpact: Math.round(netImpact * 100) / 100,
        rawDispute: d,
      };
    });
  }, [disputes]);

  // 2. Map non-disputed clean lifetime store transactions
  const cleanRows: UnifiedTransactionRow[] = useMemo(() => {
    return LIFETIME_CLEAN_TRANSACTIONS.map((tx) => ({
      transactionId: tx.transactionId,
      orderId: tx.orderId,
      date: tx.date,
      dateFormatted: new Date(tx.date).toUTCString(),
      customer: tx.customer,
      itemDescription: tx.itemDescription,
      grossAmount: tx.grossAmount,
      currency: tx.currency,
      paymentChannel: tx.paymentChannel,
      disputeStatus: 'Clean' as const,
    }));
  }, []);

  // 3. Combined Lifetime Transactions Dataset (Sorted descending by date)
  const allTransactions: UnifiedTransactionRow[] = useMemo(() => {
    return [...disputedRows, ...cleanRows].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [disputedRows, cleanRows]);

  // 4. Financial KPI Calculations across Lifetime Data
  const grossSales = useMemo(() => {
    return allTransactions.reduce((sum, tx) => sum + tx.grossAmount, 0);
  }, [allTransactions]);

  const disputeRate = useMemo(() => {
    if (allTransactions.length === 0) return 0;
    return (disputedRows.length / allTransactions.length) * 100;
  }, [allTransactions, disputedRows]);

  const totalMoneyLost = useMemo(() => {
    return disputedRows.reduce((sum, tx) => sum + (tx.moneyLost || 0), 0);
  }, [disputedRows]);

  const totalMoneyGained = useMemo(() => {
    return disputedRows.reduce((sum, tx) => sum + (tx.moneyGained || 0), 0);
  }, [disputedRows]);

  const netRetainedRevenue = useMemo(() => {
    return grossSales - totalMoneyLost;
  }, [grossSales, totalMoneyLost]);

  const retentionPercentage = useMemo(() => {
    if (grossSales === 0) return 100;
    return ((netRetainedRevenue / grossSales) * 100).toFixed(1);
  }, [grossSales, netRetainedRevenue]);

  const disputeRecoveryPnL = useMemo(() => {
    return totalMoneyGained - totalMoneyLost;
  }, [totalMoneyGained, totalMoneyLost]);

  const totalDisputeStake = useMemo(() => {
    return disputedRows.reduce((sum, tx) => sum + (tx.stakeAmount || 0), 0);
  }, [disputedRows]);

  // 5. Filtered Rows based on Selected Pill Button
  const displayedRows = useMemo(() => {
    if (filterMode === 'clean') {
      return allTransactions.filter((tx) => tx.disputeStatus === 'Clean');
    }
    if (filterMode === 'disputed') {
      return allTransactions.filter((tx) => tx.disputeStatus !== 'Clean');
    }
    return allTransactions;
  }, [filterMode, allTransactions]);

  // 6. Adaptive AG Grid Column Definitions
  const columnDefs = useMemo<ColDef<UnifiedTransactionRow>[]>(() => {
    // Base Columns (Always visible on All views)
    const baseCols: ColDef<UnifiedTransactionRow>[] = [
      {
        headerName: 'Transaction ID',
        field: 'transactionId',
        width: 175,
        pinned: 'left',
        cellRenderer: (params: { value: string; data?: UnifiedTransactionRow }) => {
          const isDisputed = params.data?.disputeStatus !== 'Clean';
          return (
            <div className="flex items-center space-x-1.5 py-0.5">
              <span className="font-mono font-bold text-slate-900 text-xs">
                {params.value}
              </span>
              {isDisputed && (
                <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                  {params.data?.disputeId}
                </span>
              )}
            </div>
          );
        },
      },
      {
        headerName: 'Date (GMT)',
        field: 'dateFormatted',
        width: 215,
        cellRenderer: (params: { value: string }) => (
          <span className="text-xs text-slate-600 font-mono">{params.value}</span>
        ),
      },
      {
        headerName: 'Customer',
        field: 'customer',
        width: 195,
        cellRenderer: (params: { value: string; data?: UnifiedTransactionRow }) => (
          <div className="py-0.5 leading-tight">
            <div className="font-bold text-slate-900 text-xs">{params.value}</div>
            <div className="text-[11px] text-slate-400 font-mono">
              {params.data?.orderId} &bull; {params.data?.itemDescription?.slice(0, 22)}...
            </div>
          </div>
        ),
      },
      {
        headerName: 'Gross Amount ($)',
        field: 'grossAmount',
        width: 155,
        cellRenderer: (params: { value: number; data?: UnifiedTransactionRow }) => (
          <div className="font-black text-slate-900 text-xs">
            ${params.value.toFixed(2)}{' '}
            <span className="font-normal text-slate-400 text-[10px]">
              {params.data?.currency || 'USD'}
            </span>
          </div>
        ),
      },
      {
        headerName: 'Payment Channel',
        field: 'paymentChannel',
        width: 150,
        cellRenderer: () => (
          <div className="pt-0.5">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Wallet className="w-3 h-3 text-blue-600" />
              <span>PayPal</span>
            </span>
          </div>
        ),
      },
      {
        headerName: 'Dispute Status',
        field: 'disputeStatus',
        width: 145,
        cellRenderer: (params: { value: 'Clean' | 'Active' | 'Won' | 'Lost' }) => {
          if (params.value === 'Clean') {
            return (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                <CheckCircle2 className="w-3 h-3 text-slate-400" />
                <span>Clean</span>
              </span>
            );
          }
          if (params.value === 'Won') {
            return (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Won</span>
              </span>
            );
          }
          if (params.value === 'Active') {
            return (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-300">
                <Clock className="w-3 h-3 text-blue-600" />
                <span>Active</span>
              </span>
            );
          }
          return (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
              <AlertTriangle className="w-3 h-3 text-rose-600" />
              <span>Lost</span>
            </span>
          );
        },
      },
    ];

    // Disputed-Only Extra Columns (Dynamically shown when 'Disputed Transactions' filter is selected)
    if (filterMode === 'disputed') {
      const disputedExtraCols: ColDef<UnifiedTransactionRow>[] = [
        {
          headerName: 'Stake Amount ($)',
          field: 'stakeAmount',
          width: 145,
          cellRenderer: (params: { value?: number }) => (
            <span className="font-bold text-slate-800 text-xs">
              ${(params.value || 0).toFixed(2)}
            </span>
          ),
        },
        {
          headerName: 'Action Taken',
          field: 'actionTaken',
          width: 175,
          cellRenderer: (params: { value?: 'Fought via Gemini' | 'Conceded' | 'Settled' }) => {
            if (params.value === 'Fought via Gemini') {
              return (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span>Fought via Gemini</span>
                </span>
              );
            }
            if (params.value === 'Settled') {
              return (
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <span>Settled</span>
                </span>
              );
            }
            return (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                <span>Conceded</span>
              </span>
            );
          },
        },
        {
          headerName: 'Money Gained ($)',
          field: 'moneyGained',
          width: 150,
          cellRenderer: (params: { value?: number }) => {
            const val = params.value || 0;
            return val > 0 ? (
              <span className="font-extrabold text-xs text-emerald-600">
                +${val.toFixed(2)}
              </span>
            ) : (
              <span className="font-mono text-xs text-slate-400">$0.00</span>
            );
          },
        },
        {
          headerName: 'Money Lost ($)',
          field: 'moneyLost',
          width: 150,
          cellRenderer: (params: { value?: number }) => {
            const val = params.value || 0;
            return val > 0 ? (
              <span className="font-extrabold text-xs text-rose-600">
                -${val.toFixed(2)}
              </span>
            ) : (
              <span className="font-mono text-xs text-slate-400">$0.00</span>
            );
          },
        },
        {
          headerName: 'Net Impact ($)',
          field: 'netImpact',
          width: 150,
          cellRenderer: (params: { value?: number }) => {
            const val = params.value || 0;
            if (val > 0) {
              return (
                <span className="inline-block px-2 py-0.5 rounded-md text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                  +${val.toFixed(2)}
                </span>
              );
            }
            if (val < 0) {
              return (
                <span className="inline-block px-2 py-0.5 rounded-md text-xs font-black bg-rose-100 text-rose-800 border border-rose-300">
                  -${Math.abs(val).toFixed(2)}
                </span>
              );
            }
            return <span className="font-bold text-xs text-slate-400">$0.00</span>;
          },
        },
        {
          headerName: 'Action',
          width: 115,
          pinned: 'right',
          cellRenderer: (params: { data?: UnifiedTransactionRow }) => {
            if (!params.data?.rawDispute) return null;
            return (
              <button
                onClick={() => onSelectDispute(params.data!.rawDispute!)}
                className="inline-flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors"
              >
                <span>Review</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            );
          },
        },
      ];

      return [...baseCols, ...disputedExtraCols];
    }

    return baseCols;
  }, [filterMode, onSelectDispute]);

  const onRowClicked = (event: RowClickedEvent<UnifiedTransactionRow>) => {
    if (event.data?.rawDispute) {
      onSelectDispute(event.data.rawDispute);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Lifetime Data & Top-Level Financial KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Gross Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gross Sales ($)
            </span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            ${grossSales.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>Cumulative across {allTransactions.length} lifetime orders</span>
          </div>
        </div>

        {/* KPI 2: Dispute Rate (%) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Dispute Rate (%)
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Percent className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {disputeRate.toFixed(1)}%
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Target: &lt; 1.5%
            </span>
          </div>
          <div className="text-xs text-slate-400 mt-1.5 flex items-center justify-between">
            <span>{disputedRows.length} disputed of {allTransactions.length} total orders</span>
          </div>
        </div>

        {/* KPI 3: Net Retained Revenue */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-50 to-white p-5 rounded-2xl border border-emerald-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-emerald-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Net Retained Revenue ($)
            </span>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-700 tracking-tight">
            ${netRetainedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-emerald-800 font-semibold mt-1.5 flex items-center justify-between">
            <span>{retentionPercentage}% revenue retained</span>
            <span className="text-slate-400 font-normal">-${totalMoneyLost.toFixed(2)} lost</span>
          </div>
        </div>

        {/* KPI 4: Dispute Recovery P&L */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-purple-900 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800">
              Dispute Recovery P&L ($)
            </span>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black text-purple-700 tracking-tight">
            +${disputeRecoveryPnL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-slate-500 mt-1.5 flex items-center justify-between">
            <span className="text-emerald-600 font-semibold">+${totalMoneyGained.toFixed(2)} won</span>
            <span className="text-slate-400 font-normal">vs -${totalMoneyLost.toFixed(2)} conceded</span>
          </div>
        </div>
      </div>

      {/* 2. Grid Container Card with Filter Bar & AG Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 space-y-4">
        {/* Header Title & Transaction Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
              <span>Lifetime PayPal Transaction Ledger</span>
              <span className="text-xs bg-slate-100 text-slate-600 font-normal px-2 py-0.5 rounded-full border border-slate-200">
                {displayedRows.length} shown
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive transaction history with real-time dispute P&amp;L intelligence
            </p>
          </div>

          {/* Transaction Filter Bar (Pill Buttons) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>All Lifetime Transactions</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterMode === 'all'
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {allTransactions.length}
              </span>
            </button>

            <button
              onClick={() => setFilterMode('clean')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                filterMode === 'clean'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Non-Disputed Transactions</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterMode === 'clean'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {cleanRows.length}
              </span>
            </button>

            <button
              onClick={() => setFilterMode('disputed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer ${
                filterMode === 'disputed'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Disputed Transactions</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  filterMode === 'disputed'
                    ? 'bg-purple-500 text-white'
                    : 'bg-rose-200 text-rose-800'
                }`}
              >
                {disputedRows.length}
              </span>
            </button>
          </div>
        </div>

        {/* Specialized Sub-Bar when 'Disputed Transactions' is Active */}
        {filterMode === 'disputed' && (
          <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 border border-purple-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="font-bold text-purple-900">
                  Dispute P&amp;L Breakdown View
                </span>
                <span className="text-purple-600 text-[11px] ml-2 hidden sm:inline">
                  (Showing Stake, Action Taken, Money Gained, Conceded Losses &amp; Dispute Fees)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-slate-700">
              <div>
                Stake: <span className="font-bold text-slate-900">${totalDisputeStake.toFixed(2)}</span>
              </div>
              <div>
                Gained (Won): <span className="font-bold text-emerald-600">+${totalMoneyGained.toFixed(2)}</span>
              </div>
              <div>
                Lost + Fees: <span className="font-bold text-rose-600">-${totalMoneyLost.toFixed(2)}</span>
              </div>
              <div className="pl-3 border-l border-purple-200">
                Net Impact:{' '}
                <span className="font-black text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                  +${disputeRecoveryPnL.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Search Filter Bar */}
        <div className="flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              placeholder="Search by transaction ID, customer, order..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-hidden transition-all text-slate-800"
            />
          </div>

          <div className="text-[11px] text-slate-400 hidden sm:block">
            {filterMode === 'disputed'
              ? 'Click Review or any row to inspect Evidence Pack & Response Drafter'
              : 'Disputed rows can be reviewed directly by clicking row'}
          </div>
        </div>

        {/* 3. AG Grid React Table */}
        <div
          className="ag-theme-quartz w-full rounded-xl overflow-hidden border border-slate-200"
          style={{ height: '520px' }}
        >
          <AgGridReact<UnifiedTransactionRow>
            rowData={displayedRows}
            columnDefs={columnDefs}
            quickFilterText={quickFilterText}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 25, 50, 100]}
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

        {/* Grid Footer Notes */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div>
            Payment Channel: <span className="font-semibold text-slate-600">PayPal Direct</span> &bull; Currency: <span className="font-semibold text-slate-600">USD</span>
          </div>
          <div>
            Standard PayPal Chargeback/Dispute Fee: <span className="font-semibold text-slate-600">$15.00/claim</span> (waived when won)
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
