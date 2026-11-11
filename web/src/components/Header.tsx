import React from 'react';
import { ShieldCheck, ShieldAlert, Database, History, Zap, BarChart3, RotateCcw } from 'lucide-react';
import { DataMode } from '../types';

interface HeaderProps {
  dataMode: DataMode;
  dryRun: boolean;
  activeTab: 'disputes' | 'analytics' | 'activity';
  setActiveTab: (tab: 'disputes' | 'analytics' | 'activity') => void;
  onRefresh?: () => void;
  refreshing?: boolean;
  onResetDemoData?: () => void;
  resetting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  dataMode,
  dryRun,
  activeTab,
  setActiveTab,
  onResetDemoData,
  resetting = false,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            {/* Shield Logo Container */}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>

            {/* Text Block Vertically Centered with Icon */}
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-2.5">
                {/* Brand Name */}
                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  VERIF<span className="text-blue-600">AI</span>
                </span>
                
                {/* Sub-Brand */}
                <span 
                  className="text-base font-bold text-slate-800 leading-none" 
                  style={{ color: '#1e293b', fontWeight: 700 }}
                >
                  Dispute Copilot for Merchants
                </span>
              </div>

              {/* Subtitle */}
              <p className="text-sm font-normal text-slate-500 mt-1 leading-none">
                Autonomous Dispute Defense System
              </p>
            </div>
          </div>

          {/* Navigation & Controls */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Nav tabs */}
            <nav className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('disputes')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  activeTab === 'disputes'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disputes
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'activity'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Log</span>
              </button>
            </nav>

            {/* Status Badges */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              {/* Mandatory Data Source Badge */}
              {dataMode === 'sandbox' ? (
                <div
                  className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 px-2.5 py-1 rounded-full text-xs font-medium"
                  title="Connected to PayPal Sandbox API"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PayPal Sandbox</span>
                </div>
              ) : (
                <div
                  className="flex items-center space-x-1.5 bg-amber-50 text-amber-800 border border-amber-300 px-2.5 py-1 rounded-full text-xs font-medium"
                  title="Using realistic simulated fixture data"
                >
                  <Database className="w-3.5 h-3.5 text-amber-600" />
                  <span>Fixture data</span>
                </div>
              )}

              {/* DRY_RUN Badge */}
              {dryRun ? (
                <div
                  className="hidden sm:flex items-center space-x-1 bg-violet-50 text-violet-700 border border-violet-200 px-2.5 py-1 rounded-full text-xs font-semibold"
                  title="Dry run mode is ON. PayPal API mutations will preview without executing."
                >
                  <Zap className="w-3 h-3 text-violet-600" />
                  <span>DRY RUN</span>
                </div>
              ) : (
                <div
                  className="hidden sm:flex items-center space-x-1 bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full text-xs font-semibold"
                  title="Dry run is OFF. Live actions will be submitted."
                >
                  <ShieldAlert className="w-3 h-3 text-red-600" />
                  <span>LIVE ACTIONS</span>
                </div>
              )}

              {/* Reset Demo Data Button */}
              {onResetDemoData && (
                <button
                  onClick={onResetDemoData}
                  disabled={resetting}
                  className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Replenish demo data back to default 6 active disputes"
                  aria-label="Replenish Demo Data"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-slate-600 ${resetting ? 'animate-spin text-blue-600' : ''}`} />
                  <span>Replenish Demo Data</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
