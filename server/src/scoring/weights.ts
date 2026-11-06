import { ScoreBand } from '../types/dispute.js';

export interface RubricWeightItem {
  id: string;
  title: string;
  points: number;
  description: string;
}

export const INR_RUBRIC_WEIGHTS: RubricWeightItem[] = [
  {
    id: 'INR_TRACKING_EXISTS',
    title: 'Tracking Number Provided',
    points: 20,
    description: 'Carrier tracking number exists and is associated with order shipment.',
  },
  {
    id: 'INR_STATUS_DELIVERED',
    title: 'Carrier Status Delivered',
    points: 30,
    description: 'Carrier tracking events confirm shipment status reached DELIVERED.',
  },
  {
    id: 'INR_DELIVERED_BEFORE_DISPUTE',
    title: 'Delivered Before Dispute Date',
    points: 10,
    description: 'Package was marked delivered prior to the buyer opening the dispute.',
  },
  {
    id: 'INR_SIGNATURE_ON_DELIVERY',
    title: 'Signature on Delivery',
    points: 15,
    description: 'Direct proof of delivery signature recorded by carrier.',
  },
  {
    id: 'INR_ADDRESS_MATCHES',
    title: 'Delivery Address Matches Order',
    points: 15,
    description: 'Delivery destination matches the buyer transaction shipping address.',
  },
  {
    id: 'INR_NO_PRE_DELIVERY_COMPLAINT',
    title: 'No Pre-Delivery Complaints',
    points: 5,
    description: 'Customer sent no complaint messages before the confirmed delivery time.',
  },
  {
    id: 'INR_NO_PRIOR_REFUND',
    title: 'No Prior Refund Issued',
    points: 5,
    description: 'No prior full or partial refund was already granted for this order.',
  },
];

export const SNAD_RUBRIC_WEIGHTS: RubricWeightItem[] = [
  {
    id: 'SNAD_LISTING_MATCHES',
    title: 'Order Listing Matches Item Description',
    points: 25,
    description: 'Item listing description precisely details item specs, condition, and model.',
  },
  {
    id: 'SNAD_RETURN_POLICY',
    title: 'Evidence of Return Policy Shown',
    points: 15,
    description: 'Documented merchant return policy displayed and accessible to buyer.',
  },
  {
    id: 'SNAD_NO_EARLIER_COMPLAINT',
    title: 'No Earlier Complaint in Messages',
    points: 15,
    description: 'Customer messages show no complaints about condition prior to order delivery.',
  },
  {
    id: 'SNAD_EVIDENCE_PRESENT',
    title: 'Item Photos / Description Evidence Present',
    points: 20,
    description: 'Detailed listing description and photographic records exist verifying item.',
  },
  {
    id: 'SNAD_NO_PRIOR_REFUND_OR_OFFER',
    title: 'No Prior Refund or Goodwill Offer',
    points: 10,
    description: 'No prior partial refund or goodwill credit has already been issued on this order.',
  },
  {
    id: 'SNAD_DELIVERY_CONFIRMED',
    title: 'Delivery Confirmed',
    points: 15,
    description: 'Carrier tracking confirms delivery so buyer is in physical possession.',
  },
];

export const SCORE_BANDS = {
  STRONG_MIN: 70,
  MEDIUM_MIN: 40,
} as const;

export function getScoreBand(score: number): ScoreBand {
  if (score >= SCORE_BANDS.STRONG_MIN) return 'strong';
  if (score >= SCORE_BANDS.MEDIUM_MIN) return 'medium';
  return 'weak';
}
