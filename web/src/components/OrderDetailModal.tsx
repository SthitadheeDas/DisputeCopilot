import React, { useState } from 'react';
import {
  X,
  Package,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  User,
  MapPin,
  Truck,
  FileText,
  Copy,
  Check,
  ArrowRight,
  Shield,
  Server,
  Calendar,
} from 'lucide-react';
import { OrderDetailViewData } from '../utils/orderData';
import { EnrichedDispute, isDisputeActive } from '../types';

interface OrderDetailModalProps {
  order: OrderDetailViewData;
  onClose: () => void;
  onReviewDispute?: (dispute: EnrichedDispute) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onReviewDispute,
}) => {
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopyTracking = () => {
    if (!order.trackingNumber || order.trackingNumber === 'N/A') return;
    navigator.clipboard.writeText(order.trackingNumber);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const isDisputed = order.disputeStatus !== 'Clean';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* 1. Order Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Order Details: {order.orderId}
                </h2>
                {/* Payment Channel Badge */}
                <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <Wallet className="w-3 h-3 text-blue-600" />
                  <span>PayPal</span>
                </span>
                {/* Dispute Status Badge */}
                {order.disputeStatus === 'Clean' && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                    <CheckCircle2 className="w-3 h-3 text-slate-500" />
                    <span>Clean (Non-Disputed)</span>
                  </span>
                )}
                {order.disputeStatus === 'Won' && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Resolved (Won)</span>
                  </span>
                )}
                {order.disputeStatus === 'Active' && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-300">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>Active Dispute</span>
                  </span>
                )}
                {order.disputeStatus === 'Lost' && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
                    <AlertTriangle className="w-3 h-3 text-rose-600" />
                    <span>Resolved (Lost)</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono">
                <span>
                  TXN: <strong className="text-slate-800">{order.transactionId}</strong>
                </span>
                <span>&bull;</span>
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  <span>{order.dateGmt}</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Dispute Notice Banner (if disputed) */}
          {isDisputed && order.rawDispute && (
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50/50 to-purple-50 border border-purple-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                      Dispute Case Linked
                    </span>
                    <span className="px-2 py-0.2 rounded-md text-[11px] font-bold bg-purple-200 text-purple-800">
                      {order.disputeId}
                    </span>
                    <span className="text-xs text-purple-700 font-semibold">
                      Reason: {order.disputeReason}
                    </span>
                  </div>
                  <p className="text-xs text-purple-800 mt-1">
                    Amount at stake: <strong className="font-bold">${order.stakeAmount?.toFixed(2)} USD</strong> &bull;
                    Winnability Score: <strong className="font-bold">{order.rawDispute.score.totalScore}/100 ({order.rawDispute.score.band.toUpperCase()})</strong>
                  </p>
                </div>
              </div>

              {onReviewDispute && (
                <button
                  onClick={() => {
                    onClose();
                    onReviewDispute(order.rawDispute!);
                  }}
                  className="inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <span>Review Dispute Case</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Clean Order Notice Banner */}
          {!isDisputed && (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-3.5 flex items-center space-x-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-xs text-emerald-900">
                <strong className="font-bold">Verified Clean Transaction:</strong> Standard tracked fulfillment completed with 100% net revenue retained. Eligible for full PayPal Seller Protection.
              </div>
            </div>
          )}

          {/* 2. Customer Info & Shipping Address Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Information Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center space-x-2 text-slate-700">
                <User className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Customer Profile
                </h4>
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Full Name:</span>
                  <span className="font-bold text-slate-900">{order.customerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-800 font-medium">
                    {order.customerEmail}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="font-medium text-slate-800">PayPal Express Checkout</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Buyer Status:</span>
                  <span className="inline-flex items-center space-x-1 text-emerald-700 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified PayPal Account</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Verified Shipping Address Card */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-700">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Verified Shipping Address
                  </h4>
                </div>
                <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>PayPal Verified</span>
                </span>
              </div>
              <div className="text-xs text-slate-700 leading-relaxed font-sans">
                <div className="font-bold text-slate-900">
                  {order.shippingAddress.recipientName || order.customerName}
                </div>
                <div>{order.shippingAddress.line1}</div>
                <div>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                  {order.shippingAddress.postalCode}
                </div>
                <div className="text-slate-500 font-semibold">
                  {order.shippingAddress.countryCode === 'US'
                    ? 'United States (US)'
                    : order.shippingAddress.countryCode}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Itemized Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
            <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-slate-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Itemized Purchase Breakdown
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Item &amp; Description</th>
                    <th className="py-2.5 px-4">SKU</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Price</th>
                    <th className="py-2.5 px-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        {item.description && (
                          <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                            {item.description}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {item.sku}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-800">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-700">
                        ${item.unitPrice.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900">
                        ${item.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Financial Summary Subtotal */}
            <div className="bg-slate-50/70 p-4 border-t border-slate-200 flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-800">${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tracked Parcel Shipping:</span>
                  <span className="font-semibold text-emerald-700">FREE ($0.00)</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Tax:</span>
                  <span className="font-semibold text-slate-800">${order.tax.toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline text-sm font-black text-slate-900">
                  <span>Total Amount Paid:</span>
                  <span className="text-base text-blue-700">
                    ${order.totalAmount.toFixed(2)}{' '}
                    <span className="text-xs font-normal text-slate-500">{order.currency}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Fulfillment & Proof Logs */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Fulfillment &amp; Carrier Proof Logs
                </h4>
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="font-bold text-slate-600">Carrier:</span>
                <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {order.carrier}
                </span>
                <span className="font-bold text-slate-600 ml-2">Status:</span>
                {order.deliveryStatus === 'DELIVERED' ? (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>DELIVERED</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-300">
                    <Clock className="w-3 h-3 text-blue-600" />
                    <span>{order.deliveryStatus}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Tracking Number Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-slate-500 uppercase tracking-wide text-[11px]">
                  Tracking Number:
                </span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {order.trackingNumber}
                </span>
                {order.trackingNumber !== 'N/A' && (
                  <button
                    onClick={handleCopyTracking}
                    className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    title="Copy tracking number"
                  >
                    {copiedTracking ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>

              {order.deliveredAtGmt && (
                <div className="text-slate-600 text-xs font-mono">
                  Delivered on: <strong className="text-slate-900">{order.deliveredAtGmt}</strong>
                  {order.signedBy && (
                    <span className="ml-1 text-emerald-700 font-semibold">
                      (Signed by {order.signedBy})
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Tracking Events Timeline */}
            {order.trackingEvents.length > 0 ? (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Carrier Event Audit Trail (All Times GMT)
                </div>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
                  {order.trackingEvents.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            ev.status === 'DELIVERED'
                              ? 'bg-emerald-500'
                              : ev.status === 'OUT_FOR_DELIVERY'
                              ? 'bg-blue-500'
                              : 'bg-slate-400'
                          }`}
                        />
                        <span className="font-bold text-slate-800">{ev.status}</span>
                        <span className="text-slate-400">&bull;</span>
                        <span className="text-slate-600">{ev.location}</span>
                        {ev.signedBy && (
                          <span className="text-emerald-700 font-medium">
                            (Signed: {ev.signedBy})
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-slate-500 text-[11px]">
                        {ev.timeGmt}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                No external carrier events logged for this untracked/custom transaction.
              </div>
            )}

            {/* IP Address & Server Access Proof Log */}
            <div className="bg-slate-900 text-slate-300 rounded-xl p-3 text-xs font-mono space-y-1">
              <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-sans font-bold uppercase tracking-wider">
                <Server className="w-3.5 h-3.5 text-blue-400" />
                <span>Security &amp; Fulfillment Proof Log</span>
              </div>
              <div className="text-slate-200 text-[11px] break-all leading-relaxed">
                {order.ipLog}
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800">
                <span>Session ID: {order.sessionId}</span>
                <span>Audit Status: VERIFIED LOCKED TO UTC/GMT</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-500 hidden sm:block">
            Order ID: <strong className="text-slate-700">{order.orderId}</strong> &bull; Channel:{' '}
            <strong className="text-slate-700">PayPal Direct</strong>
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            {isDisputed && order.rawDispute && onReviewDispute && (
              <button
                onClick={() => {
                  onClose();
                  onReviewDispute(order.rawDispute!);
                }}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 ${
                  isDisputeActive(order.rawDispute)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isDisputeActive(order.rawDispute) ? (
                  <>
                    <span>Review Dispute Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>View Submitted Evidence</span>
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
