import React, { useState } from 'react';
import { Sparkles, ChevronDown, ChevronUp, Scale, Shield, FileText } from 'lucide-react';

export const JudgeIntroBanner: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-600 text-white p-2 rounded-xl mt-0.5 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900">
                What is Dispute Copilot?
              </h2>
              <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
                Hackathon Overview
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              An intelligent dispute defense assistant that joins PayPal payment disputes with store order data,
              computes a <strong>deterministic winnability score (0–100)</strong>, and drafts evidence-backed responses using Gemini with mandatory human approval.
            </p>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-blue-700 hover:text-blue-900 font-medium flex items-center space-x-1 ml-4 mt-1 bg-white px-2.5 py-1 rounded-lg border border-blue-200 transition-colors shadow-2xs"
        >
          <span>{expanded ? 'Less info' : 'Learn more'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-blue-200/60 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
          <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
            <div className="flex items-center space-x-2 font-semibold text-slate-900 mb-1">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>100% Deterministic Scoring</span>
            </div>
            <p className="text-slate-600">
              Evaluates disputes against strict rubrics (tracking, delivery timestamps, signature on delivery, address matching, and prior refunds) with zero AI hallucination in scores.
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
            <div className="flex items-center space-x-2 font-semibold text-slate-900 mb-1">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Grounded Evidence Packs</span>
            </div>
            <p className="text-slate-600">
              Correlates dispute records with simulated store shipments, customer chat logs, and carrier milestones into citation-indexed facts (e.g., F1, F2).
            </p>
          </div>

          <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
            <div className="flex items-center space-x-2 font-semibold text-slate-900 mb-1">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span>Human-In-The-Loop Guardrails</span>
            </div>
            <p className="text-slate-600">
              No API mutations execute autonomously. Merchants preview the exact PayPal payload and must click Approve before any evidence or refund offer is sent.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
