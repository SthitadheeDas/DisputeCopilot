/**
 * Backend Mock State & Simulation Services
 * Exposes operations for simulated store orders and PayPal dispute fixtures.
 */
import {
  loadFixtureDisputes,
  findFixtureDisputeById,
  updateFixtureDispute,
} from '../store/fixtures.js';
import {
  loadStoreOrders,
  findOrderByTransactionId,
  findOrderByOrderId,
  addOrderRefund,
} from '../store/store.js';
import { getCachedAnalysis, setCachedAnalysis } from '../store/cache.js';

export {
  loadFixtureDisputes,
  findFixtureDisputeById,
  updateFixtureDispute,
  loadStoreOrders,
  findOrderByTransactionId,
  findOrderByOrderId,
  addOrderRefund,
  getCachedAnalysis,
  setCachedAnalysis,
};

/**
 * Updates dispute resolution status and financial recovery metrics in the mock store.
 */
export function resolveDisputeMock(
  disputeId: string,
  resolution: 'RESOLVED_ACCEPTED' | 'CONCEDED' | 'SETTLED' | 'WON',
  details?: { refundAmount?: number; note?: string }
) {
  const statusMap: Record<string, string> = {
    RESOLVED_ACCEPTED: 'RESOLVED_ACCEPTED',
    CONCEDED: 'CONCEDED',
    SETTLED: 'RESOLVED',
    WON: 'RESOLVED',
  };

  const updatedDispute = updateFixtureDispute(disputeId, {
    status: statusMap[resolution] || 'RESOLVED',
    dispute_state: 'RESOLVED',
    dispute_lifecycle_stage: 'RESOLVED',
  });

  if (details?.refundAmount && details.refundAmount > 0) {
    const txnId = updatedDispute?.disputed_transactions?.[0]?.seller_transaction_id;
    if (txnId) {
      addOrderRefund(
        txnId,
        details.refundAmount,
        details.note || `Refund issued for dispute ${disputeId}`
      );
    }
  }

  return updatedDispute;
}
