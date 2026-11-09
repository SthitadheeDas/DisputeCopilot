import React, { useEffect, useState, useCallback } from 'react';
import { Header } from './components/Header';
import { DisputeTable } from './components/DisputeTable';
import { DisputeDetailModal } from './components/DisputeDetailModal';
import { ActivityLogView } from './components/ActivityLogView';
import { AnalyticsTab } from './components/AnalyticsTab';
import { fetchDisputes, fetchHealth } from './api';
import { EnrichedDispute, DataMode } from './types';
import { ShieldCheck, AlertTriangle, DollarSign, Clock, RefreshCw } from 'lucide-react';

// Active dispute check: Filters out resolved, conceded, or closed claims
export const isDisputeActive = (d: EnrichedDispute): boolean => {
  const status = (d.status || '').toUpperCase();
  const lifecycle = (d.dispute_lifecycle_stage || '').toUpperCase();
  const state = (d.dispute_state || '').toUpperCase();

  if (
    status === 'RESOLVED' ||
    status === 'RESOLVED_ACCEPTED' ||
    status === 'RESOLVED_DEFENDED' ||
    status === 'DEFENDED' ||
    status === 'CONCEDED' ||
    status === 'CLOSED' ||
    status === 'UNDER_REVIEW' ||
    status === 'NO_ACTION_REQUIRED' ||
    lifecycle === 'RESOLVED' ||
    state === 'RESOLVED' ||
    state === 'NO_ACTION_REQUIRED'
  ) {
    return false;
  }
  return true;
};

export const App: React.FC = () => {
  const [dataMode, setDataMode] = useState<DataMode>('fixture');
  const [dryRun, setDryRun] = useState<boolean>(true);
  const [disputes, setDisputes] = useState<EnrichedDispute[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [resetting, setResetting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'disputes' | 'analytics' | 'activity'>('disputes');
  const [selectedDispute, setSelectedDispute] = useState<EnrichedDispute | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [health, res] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchDisputes(),
      ]);

      if (health) {
        setDataMode(health.dataMode);
        setDryRun(health.dryRun);
      } else {
        setDataMode(res.dataMode);
        setDryRun(res.dryRun);
      }

      setDisputes(res.disputes);

      // Keep selectedDispute updated if modal is open
      if (selectedDispute) {
        const updated = res.disputes.find((d) => d.dispute_id === selectedDispute.dispute_id);
        if (updated) setSelectedDispute(updated);
      }
    } catch (err: unknown) {
      console.error('Error loading disputes:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to backend server');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedDispute]);

  const handleResetDemoData = useCallback(async () => {
    setResetting(true);
    try {
      const API_BASE =
        (import.meta as any).env?.VITE_API_URL || 'https://disputecopilot.onrender.com/api';
      await fetch(`${API_BASE}/disputes/reset`, {
        method: 'POST',
      });
      await loadData(true);
    } catch (err: unknown) {
      console.error('Failed to reset demo data:', err);
    } finally {
      setResetting(false);
    }
  }, [loadData]);

  useEffect(() => {
    loadData();
  }, []);

  // Filter active disputes for main queue
  const activeDisputes = React.useMemo(() => {
    return disputes.filter(isDisputeActive);
  }, [disputes]);

  // Compute summary metrics strictly for active disputes
  const totalAmount = React.useMemo(
    () =>
      activeDisputes.reduce(
        (sum, d) => sum + parseFloat(d.dispute_amount.value || '0'),
        0
      ),
    [activeDisputes]
  );
  const urgentCount = React.useMemo(
    () => activeDisputes.filter((d) => d.hoursRemaining <= 48).length,
    [activeDisputes]
  );
  const strongDefenseCount = React.useMemo(
    () => activeDisputes.filter((d) => d.score.band === 'strong').length,
    [activeDisputes]
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <Header
        dataMode={dataMode}
        dryRun={dryRun}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={() => loadData(true)}
        refreshing={refreshing}
        onResetDemoData={handleResetDemoData}
        resetting={resetting}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'activity' ? (
          <ActivityLogView onBack={() => setActiveTab('disputes')} />
        ) : activeTab === 'analytics' ? (
          <AnalyticsTab
            disputes={disputes}
            onSelectDispute={(dispute) => setSelectedDispute(dispute)}
          />
        ) : (
          <div className="space-y-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Total At Stake
                  </span>
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                    <DollarSign className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900">
                  ${totalAmount.toFixed(2)}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Across {activeDisputes.length} active customer claims
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Urgent Deadlines
                  </span>
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-rose-600">
                  {urgentCount}
                </div>
                <div className="text-xs text-rose-500 font-medium mt-1">
                  Under 48 hours to merchant default
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Strong Winnability
                  </span>
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-2xl font-black text-emerald-600">
                  {strongDefenseCount}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  Cases with score &ge; 70 points
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Active Data Source
                  </span>
                  <div className="p-2 bg-slate-100 text-slate-600 rounded-xl">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-lg font-bold text-slate-900 capitalize">
                  {dataMode === 'sandbox' ? 'PayPal Sandbox' : 'Fixture Data'}
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {dryRun ? 'Dry run safety harness enabled' : 'Live submissions permitted'}
                </div>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800">
                <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm">Backend Communication Error</h4>
                <p className="text-xs mt-1">{error}</p>
                <button
                  onClick={() => loadData(false)}
                  className="mt-3 px-4 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-rose-700 transition-colors"
                >
                  Retry Connection
                </button>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                <h4 className="font-bold text-slate-800 text-sm">Loading Dispute Copilot...</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Pulling active claims, matching orders, and computing deterministic rubric scores
                </p>
              </div>
            ) : (
              /* Disputes Table (Active Queue Only) */
              <DisputeTable
                disputes={activeDisputes}
                onSelectDispute={(dispute) => setSelectedDispute(dispute)}
              />
            )}
          </div>
        )}
      </main>

      {/* Detail Review & Action Modal */}
      {selectedDispute && (
        <DisputeDetailModal
          dispute={selectedDispute}
          dryRun={dryRun}
          onClose={() => setSelectedDispute(null)}
          onActionComplete={() => loadData(true)}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-medium text-slate-700">
            Dispute Copilot &bull; Built for the PayPal AI Hackathon
          </p>
          <p className="text-slate-400">
            Note: Store order fulfillment data is simulated in <code className="bg-slate-100 px-1 py-0.5 rounded">data/store.json</code>. PayPal Dispute API communication runs in Sandbox environment.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default App;
