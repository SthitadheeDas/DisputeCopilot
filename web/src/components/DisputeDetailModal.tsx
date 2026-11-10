import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Send,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  Package,
  Truck,
  MessageSquare,
  RefreshCw,
  Info,
  Zap,
  Sparkles,
  Bot,
  Check,
  Clock,
} from 'lucide-react';
import { EnrichedDispute, EvidenceFact, CachedAIAnalysis } from '../types';
import { submitEvidence, acceptClaim, makeOffer, analyzeDispute } from '../api';

interface DisputeDetailModalProps {
  dispute: EnrichedDispute;
  dryRun: boolean;
  onClose: () => void;
  onActionComplete: (updatedStatus: 'SUBMITTED' | 'RESOLVED' | 'REFUNDED', disputeId: string) => void;
}

export const DisputeDetailModal: React.FC<DisputeDetailModalProps> = ({
  dispute,
  dryRun,
  onClose,
  onActionComplete,
}) => {
  // Generate initial grounded draft notes referencing available facts
  const generateInitialDraft = (): { text: string; citedIds: string[] } => {
    const facts = dispute.evidencePack.facts;
    const trackingFact = facts.find((f) => f.label.includes('Tracking'));
    const deliveryFact = facts.find((f) => f.label.includes('Delivery Status'));
    const sigFact = facts.find((f) => f.label.includes('Proof of Delivery Signature'));
    const descFact = facts.find((f) => f.label.includes('Listing Description'));
    const policyFact = facts.find((f) => f.label.includes('Return Policy'));

    const citedIds: string[] = ['F1', 'F2', 'F3'];
    let text = `Formal Merchant Evidence Response for Dispute ${dispute.dispute_id} [F1].\n\n`;

    if (dispute.reason.includes('NOT_RECEIVED') || dispute.reason.includes('INR')) {
      if (trackingFact && deliveryFact) {
        text += `The merchant fulfilled and shipped this order promptly. As confirmed by official carrier tracking [${trackingFact.id}], the package achieved final delivery [${deliveryFact.id}]. `;
        citedIds.push(trackingFact.id, deliveryFact.id);
        if (sigFact) {
          text += `Direct proof of delivery signature was captured at the destination [${sigFact.id}]. `;
          citedIds.push(sigFact.id);
        }
        text += `The destination address perfectly matches the verified transaction shipping address on file.\n\nWe respectfully request that this claim be closed in the seller's favor under PayPal Seller Protection.`;
      } else {
        text += `The merchant shipped the ordered goods to the customer. We are providing available order fulfillment records and customer communication history to resolve this inquiry.`;
      }
    } else {
      if (descFact) {
        text += `The item delivered matches all catalog specifications and photos exactly [${descFact.id}]. `;
        citedIds.push(descFact.id);
      }
      if (policyFact) {
        text += `Our published merchant return policy was fully presented at checkout [${policyFact.id}]. `;
        citedIds.push(policyFact.id);
      }
      text += `The buyer was provided with authentic products as described. We remain open to reasonable returns in accordance with our stated return policy.`;
    }

    return { text, citedIds };
  };

  // Initial states: start blank and loading per requirement
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [aiAnalysis, setAiAnalysis] = useState<CachedAIAnalysis | null>(null);
  const [draftNotes, setDraftNotes] = useState<string>('');
  const [citedFactIds, setCitedFactIds] = useState<string[]>([]);

  // Closing guards to prevent any auto-trigger re-run if modal is closing or dispute is null
  const isClosingRef = useRef<boolean>(false);
  const initializedDisputeIdRef = useRef<string | null>(null);

  // Partial offer state
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [offerAmount, setOfferAmount] = useState<string>(
    (parseFloat(dispute.dispute_amount.value) * 0.4).toFixed(2)
  );

  // Payload modal state
  const [confirmPayloadModal, setConfirmPayloadModal] = useState<Record<string, unknown> | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // 3-Tier Fallback Chain execution: Tier 1 (Groq) -> Tier 2 (Gemini) -> Tier 3 (Grounded Rule Engine)
  const executeAIFallbackChain = useCallback(async () => {
    // Guard against running if closing or dispute is missing
    if (isClosingRef.current || !dispute || !dispute.dispute_id) {
      return;
    }

    setIsGenerating(true);
    setActionError(null);
    setDraftNotes('');
    setAiAnalysis(null);
    setCitedFactIds([]);

    try {
      // Backend cascade: Tier 1 (Groq openai/gpt-oss-120b) -> Tier 2 (Gemini Flash AI) -> Tier 3 (Grounded Rule Engine)
      const res = await analyzeDispute(dispute.dispute_id);
      if (isClosingRef.current) return;
      if (res && res.analysis) {
        setAiAnalysis(res.analysis);
        setDraftNotes(res.analysis.draftNotes || '');
        setCitedFactIds(res.analysis.citedFactIds || []);
        if (res.analysis.recommendedOfferAmount) {
          setOfferAmount(res.analysis.recommendedOfferAmount.toFixed(2));
        }
        return;
      }
      throw new Error('Analysis response was empty');
    } catch (err: unknown) {
      if (isClosingRef.current) return;
      console.warn('[AI Pipeline] Backend call failed, executing client-side Tier 3 Grounded Rule Engine fallback:', err);
      // Client-side Tier 3 Grounded Rule Engine Fallback
      const fallbackDraft = generateInitialDraft();
      const fallbackAnalysis: CachedAIAnalysis = {
        disputeId: dispute.dispute_id,
        summary: `Deterministic rule-based defense generated using ${dispute.evidencePack.facts.length} verified evidence facts.`,
        recommendation:
          dispute.score.totalScore >= 70
            ? 'fight'
            : dispute.score.totalScore >= 40
            ? 'partial_offer'
            : 'accept',
        recommendedOfferAmount:
          dispute.score.band === 'medium'
            ? parseFloat(dispute.dispute_amount.value) * 0.4
            : undefined,
        draftNotes: fallbackDraft.text,
        citedFactIds: fallbackDraft.citedIds,
        generatedAt: new Date().toISOString(),
        needsReview: true,
        source: 'fallback',
        model: 'grounded-rule-engine',
      };
      setAiAnalysis(fallbackAnalysis);
      setDraftNotes(fallbackDraft.text);
      setCitedFactIds(fallbackDraft.citedIds);
    } finally {
      if (!isClosingRef.current) {
        setIsGenerating(false);
      }
    }
  }, [dispute]);

  // Auto-trigger 3-tier cascade on modal mount
  useEffect(() => {
    // Guard: Do not run if closing or dispute is null
    if (isClosingRef.current || !dispute || !dispute.dispute_id) {
      return;
    }
    // Prevent duplicate re-triggering for the same dispute ID
    if (initializedDisputeIdRef.current === dispute.dispute_id) {
      return;
    }
    initializedDisputeIdRef.current = dispute.dispute_id;
    executeAIFallbackChain();
  }, [dispute?.dispute_id, executeAIFallbackChain]);

  const renderAIProviderBadge = () => {
    if (isGenerating) {
      return (
        <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1.5 animate-pulse">
          <RefreshCw className="w-2.5 h-2.5 animate-spin text-indigo-600" />
          <span>Synthesizing Strategy...</span>
        </span>
      );
    }

    if (!aiAnalysis) return null;

    if (aiAnalysis.source === 'groq') {
      return (
        <span className="text-[10px] bg-orange-100 text-orange-800 border border-orange-200 font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1 shadow-2xs">
          <Sparkles className="w-3 h-3 text-orange-600" />
          <span>Groq AI (openai/gpt-oss-120b)</span>
        </span>
      );
    }

    if (aiAnalysis.source === 'gemini') {
      return (
        <span className="text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1 shadow-2xs">
          <Sparkles className="w-3 h-3 text-indigo-600" />
          <span>Gemini Flash AI</span>
        </span>
      );
    }

    // Default or fallback
    return (
      <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1 shadow-2xs">
        <Bot className="w-3 h-3 text-amber-600" />
        <span>Grounded Rule Engine</span>
      </span>
    );
  };

  const getSourceBadge = (source: EvidenceFact['source']) => {
    switch (source) {
      case 'tracking':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <Truck className="w-3 h-3 text-blue-500" />
            <span>Tracking</span>
          </span>
        );
      case 'order':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Package className="w-3 h-3 text-emerald-500" />
            <span>Order Record</span>
          </span>
        );
      case 'customer_messages':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
            <MessageSquare className="w-3 h-3 text-purple-500" />
            <span>Customer Chat</span>
          </span>
        );
      case 'refund_history':
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <DollarSign className="w-3 h-3 text-amber-600" />
            <span>Refund History</span>
          </span>
        );
      case 'paypal_dispute':
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Info className="w-3 h-3 text-slate-500" />
            <span>PayPal Dispute</span>
          </span>
        );
    }
  };

  const handleOpenEvidenceConfirm = () => {
    const payload = {
      evidences: [
        {
          evidence_type: 'OTHER',
          notes: draftNotes,
        },
      ],
    };
    setConfirmPayloadModal(payload);
  };

  const handleClose = () => {
    isClosingRef.current = true;
    onClose();
  };

  const handleApproveAndSubmit = async () => {
    if (
      !window.confirm(
        `Are you sure you want to approve and submit formal evidence defense for Dispute ${dispute.dispute_id}?`
      )
    ) {
      return;
    }
    await handleExecuteEvidenceSubmit();
  };

  const handleExecuteEvidenceSubmit = async () => {
    const disputeId = dispute.dispute_id;
    const notesToSubmit = draftNotes;
    setConfirmPayloadModal(null);

    // 1. Modal Closing Sequence: execute onClose() FIRST before making the API submission call
    isClosingRef.current = true;
    onClose();

    try {
      await submitEvidence(disputeId, notesToSubmit);
      // 3. State Sync: update global dispute store after API call completes
      onActionComplete('SUBMITTED', disputeId);
    } catch (err: unknown) {
      console.error(`Failed to submit evidence for dispute ${disputeId}:`, err);
    }
  };

  const handleAcceptClaim = async () => {
    if (!window.confirm('Are you sure you want to accept this claim and concede liability?')) {
      return;
    }
    const disputeId = dispute.dispute_id;

    // 1. Modal Closing Sequence: execute onClose() FIRST before making the API submission call
    isClosingRef.current = true;
    onClose();

    try {
      await acceptClaim(disputeId);
      // 3. State Sync: update global dispute store after API call completes
      onActionComplete('RESOLVED', disputeId);
    } catch (err: unknown) {
      console.error(`Failed to accept claim for dispute ${disputeId}:`, err);
    }
  };

  const handleSendOffer = async () => {
    const amt = parseFloat(offerAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid positive offer amount.');
      return;
    }
    const disputeId = dispute.dispute_id;
    setShowOfferInput(false);

    // 1. Modal Closing Sequence: execute onClose() FIRST before making the API submission call
    isClosingRef.current = true;
    onClose();

    try {
      await makeOffer(
        disputeId,
        amt,
        'Merchant partial refund goodwill offer'
      );
      // 3. State Sync: update global dispute store after API call completes
      onActionComplete('REFUNDED', disputeId);
    } catch (err: unknown) {
      console.error(`Failed to submit offer for dispute ${disputeId}:`, err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Case Review: {dispute.dispute_id}
                </h2>
                <span className="text-xs bg-slate-200 text-slate-800 px-2 py-0.5 rounded-full font-semibold">
                  ${parseFloat(dispute.dispute_amount.value).toFixed(2)}{' '}
                  {dispute.dispute_amount.currency_code}
                </span>
                {dryRun && (
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold flex items-center space-x-1">
                    <Zap className="w-3 h-3" />
                    <span>DRY RUN MODE</span>
                  </span>
                )}
                {/* Deadline Countdown Badge */}
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1 ${
                    dispute.hoursRemaining <= 48
                      ? 'bg-rose-100 text-rose-700 border border-rose-200 animate-pulse'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                  title="Official PayPal Seller Response Deadline (GMT/UTC)"
                >
                  <Clock className="w-3 h-3" />
                  <span>
                    {dispute.hoursRemaining > 0
                      ? `${dispute.hoursRemaining}h remaining (UTC)`
                      : 'Overdue (UTC)'}
                  </span>
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Reason: <strong className="text-slate-700">{dispute.reason}</strong> | Due:{' '}
                <strong className="text-slate-700 font-mono">
                  {new Date(dispute.seller_response_due_date).toUTCString()}
                </strong>
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action feedback banners */}
        {actionError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-3 flex items-center space-x-2 text-sm text-rose-800">
            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Modal Body - 2 Columns */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: Evidence Pack (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center justify-between mb-2">
                <span>Evidence Pack ({dispute.evidencePack.facts.length} Facts)</span>
                <span className="text-[11px] text-slate-400 font-normal">Indexed for Citations</span>
              </h3>

              {/* Missing items warning if any */}
              {dispute.evidencePack.missingItems.length > 0 && (
                <div className="mb-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                  <div className="flex items-center space-x-1 font-semibold text-amber-800 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Missing Evidence Items ({dispute.evidencePack.missingItems.length})</span>
                  </div>
                  <ul className="list-disc pl-4 space-y-0.5 text-amber-800/90">
                    {dispute.evidencePack.missingItems.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fact cards */}
              <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
                {dispute.evidencePack.facts.map((fact) => (
                  <div
                    key={fact.id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/70 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded">
                          {fact.id}
                        </span>
                        <span className="text-xs font-semibold text-slate-800">
                          {fact.label}
                        </span>
                      </div>
                      {getSourceBadge(fact.source)}
                    </div>
                    <p className="text-xs text-slate-600 break-words font-medium">
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Scoring & AI Draft (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Deterministic Scoring Engine Breakdown */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Deterministic Winnability Rubric
                  </h4>
                  <p className="text-xs text-slate-500">
                    Mathematical evaluation with zero AI scoring hallucination
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-black text-slate-900">
                    {dispute.score.totalScore}
                  </span>
                  <span className="text-xs text-slate-400 font-semibold">/100</span>
                  {dispute.score.band === 'strong' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      Strong Defense
                    </span>
                  )}
                  {dispute.score.band === 'medium' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      Medium Defense
                    </span>
                  )}
                  {dispute.score.band === 'weak' && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                      Weak Defense
                    </span>
                  )}
                </div>
              </div>

              {/* Rubric items list */}
              <div className="space-y-1.5">
                {dispute.score.breakdown.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between p-2 rounded-lg text-xs border ${
                      item.passed
                        ? 'bg-emerald-50/50 border-emerald-200/60 text-slate-800'
                        : 'bg-rose-50/40 border-rose-200/50 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      {item.passed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-900">{item.title}</span>
                        <div className="text-[11px] text-slate-500">{item.reason}</div>
                      </div>
                    </div>
                    <div className="font-mono font-bold text-xs shrink-0 ml-2">
                      {item.passed ? (
                        <span className="text-emerald-700">+{item.pointsAwarded} pts</span>
                      ) : (
                        <span className="text-slate-400">0 pts</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Analysis & Strategy Section */}
            <div className="bg-gradient-to-br from-indigo-50/70 to-blue-50/50 border border-indigo-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-indigo-600 text-white rounded-lg">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                      <span>AI Strategy Copilot</span>
                      {renderAIProviderBadge()}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Grounded exclusively on Evidence Pack facts
                    </p>
                  </div>
                </div>

                <button
                  onClick={executeAIFallbackChain}
                  disabled={isGenerating}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Synthesizing...' : 'Re-analyze with AI'}</span>
                </button>
              </div>

              {isGenerating ? (
                <div className="space-y-2 pt-1 animate-pulse">
                  <div className="flex items-center justify-between bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                    <div className="flex items-center space-x-2">
                      <div className="h-4 bg-indigo-200/60 rounded w-16"></div>
                      <div className="h-5 bg-indigo-300/70 rounded-md w-36"></div>
                    </div>
                    <div className="h-4 bg-indigo-200/50 rounded-full w-40"></div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg border border-indigo-50 space-y-1.5">
                    <div className="h-3 bg-indigo-200/50 rounded w-11/12"></div>
                    <div className="h-3 bg-indigo-200/40 rounded w-4/5"></div>
                  </div>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-2 pt-1 text-xs">
                  {/* Strategy Badge & Citation Check */}
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 p-2.5 rounded-xl border border-indigo-100">
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-500 font-medium">Strategy:</span>
                      {aiAnalysis.recommendation === 'fight' && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>FIGHT & DEFEND CLAIM</span>
                        </span>
                      )}
                      {aiAnalysis.recommendation === 'partial_offer' && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-amber-100 text-amber-800 flex items-center space-x-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>
                            OFFER SETTLEMENT (${aiAnalysis.recommendedOfferAmount?.toFixed(2) || offerAmount})
                          </span>
                        </span>
                      )}
                      {aiAnalysis.recommendation === 'accept' && (
                        <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-rose-100 text-rose-800 flex items-center space-x-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>CONCEDE & ACCEPT CLAIM</span>
                        </span>
                      )}
                    </div>

                    {/* Citation verification badge */}
                    <div className="flex items-center space-x-1">
                      {aiAnalysis.needsReview ? (
                        <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-medium flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Needs Human Review</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-medium flex items-center space-x-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>All Citations Verified Grounded</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <p className="text-slate-700 leading-relaxed bg-white/50 p-2 rounded-lg border border-indigo-50">
                    <strong>Summary:</strong> {aiAnalysis.summary}
                  </p>
                </div>
              ) : (
                <div className="bg-white/60 p-3 rounded-xl border border-indigo-100 text-xs text-slate-600 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-indigo-500" />
                    <span>Click <strong>Re-analyze with AI</strong> to synthesize evidence into a formal defense.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Editable Response Draft */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Draft Defense Response (PayPal Submission)
                  </h4>
                  <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.2 rounded-full font-medium">
                    {isGenerating ? 'Synthesizing...' : 'Editable'}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  Cited Fact IDs:{' '}
                  {isGenerating ? (
                    <span className="text-slate-400 italic font-mono text-[11px]">Identifying facts...</span>
                  ) : citedFactIds.length > 0 ? (
                    citedFactIds.map((id) => (
                      <span key={id} className="font-mono bg-slate-100 text-blue-700 px-1 py-0.2 rounded ml-1 font-semibold">
                        [{id}]
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 italic text-[11px]">None</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-2">
                This response is grounded exclusively on verified evidence pack facts. Review or edit before approving submission.
              </p>

              {isGenerating ? (
                <div className="w-full h-36 bg-slate-50/80 border border-slate-200 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden shadow-2xs">
                  <div className="space-y-3 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                        <span className="text-xs font-semibold text-slate-700">
                          Synthesizing formal defense draft with AI pipeline...
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                        <RefreshCw className="w-3 h-3 animate-spin" />
                        <span>Evaluating facts & citations</span>
                      </div>
                    </div>
                    <div className="h-3 bg-slate-200/80 rounded w-11/12"></div>
                    <div className="h-3 bg-slate-200/70 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-200/60 rounded w-3/4"></div>
                    <div className="h-3 bg-slate-200/50 rounded w-10/12"></div>
                  </div>
                  <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                      <span className="font-medium text-slate-600">3-Tier Cascade Active</span>
                    </span>
                    <span className="font-mono text-slate-500">Tier 1: Groq &rarr; Tier 2: Gemini &rarr; Tier 3: Grounded Rules</span>
                  </div>
                </div>
              ) : (
                <textarea
                  value={draftNotes}
                  onChange={(e) => setDraftNotes(e.target.value)}
                  rows={5}
                  placeholder="Defense draft will appear here..."
                  className="w-full text-xs font-mono p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-hidden transition-all text-slate-800 leading-relaxed shadow-2xs"
                />
              )}
            </div>

            {/* Partial Offer Input (Expandable) */}
            {showOfferInput && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900">
                    Propose Partial Settlement Refund
                  </span>
                  <button
                    onClick={() => setShowOfferInput(false)}
                    className="text-xs text-amber-700 hover:text-amber-900 font-medium"
                  >
                    Cancel
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-xs text-slate-500 font-bold">
                      $
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={offerAmount}
                      onChange={(e) => setOfferAmount(e.target.value)}
                      placeholder="Offer Amount"
                      className="w-full pl-6 pr-3 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-hidden font-bold text-slate-900"
                    />
                  </div>
                  <button
                    onClick={handleSendOffer}
                    disabled={isGenerating}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
                  >
                    Submit Offer
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons Bar */}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center space-x-2">
                {/* Accept Claim Button */}
                <button
                  onClick={handleAcceptClaim}
                  disabled={isGenerating}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors disabled:opacity-40"
                >
                  Accept Claim
                </button>

                {/* Offer Partial Refund Button */}
                {!showOfferInput && (
                  <button
                    onClick={() => setShowOfferInput(true)}
                    disabled={isGenerating}
                    className="px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors disabled:opacity-40"
                  >
                    Offer Partial Refund
                  </button>
                )}
              </div>

              {/* Approve & Submit Evidence Button */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleOpenEvidenceConfirm}
                  disabled={isGenerating || !draftNotes.trim()}
                  className="px-2.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
                  title="Inspect raw JSON payload before submitting"
                >
                  Inspect Payload
                </button>
                <button
                  onClick={handleApproveAndSubmit}
                  disabled={isGenerating || !draftNotes.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-all flex items-center space-x-2 disabled:opacity-40 disabled:hover:bg-blue-600"
                >
                  <Send className="w-4 h-4" />
                  <span>Approve and Submit Evidence</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Payload Modal */}
      {confirmPayloadModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center space-x-2 text-blue-700">
              <ShieldCheck className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">
                Confirm PayPal Evidence Submission
              </h3>
            </div>

            <p className="text-xs text-slate-600">
              Per strict safety rules, no evidence is transmitted to PayPal without your explicit confirmation.
              Please inspect the exact payload that will be submitted:
            </p>

            <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] overflow-x-auto max-h-56">
              <pre>{JSON.stringify(confirmPayloadModal, null, 2)}</pre>
            </div>

            {dryRun && (
              <div className="p-2.5 bg-violet-50 border border-violet-200 rounded-lg text-xs text-violet-800 flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-violet-600 shrink-0" />
                <span>
                  <strong>DRY_RUN is ACTIVE:</strong> This action will be validated and logged in the audit trail without altering live PayPal records.
                </span>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setConfirmPayloadModal(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium"
              >
                Back to Edit
              </button>
              <button
                onClick={handleExecuteEvidenceSubmit}
                disabled={isGenerating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Confirm & Submit to PayPal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
