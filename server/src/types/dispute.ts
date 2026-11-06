export type StandardDisputeReason =
  | 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED'
  | 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED';

export type DisputeReasonAlias = 'ITEM_NOT_RECEIVED' | 'NOT_AS_DESCRIBED';

export type DisputeReason = StandardDisputeReason | DisputeReasonAlias;

export interface StoreItem {
  name: string;
  description: string;
  price: number;
}

export interface StoreAddress {
  recipientName?: string;
  line1: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

export interface TrackingEvent {
  time: string;
  status: 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | string;
  location: string;
  signedBy?: string;
}

export interface RefundRecord {
  amount: number;
  date: string;
  reason: string;
}

export interface CustomerMessage {
  time: string;
  from: 'customer' | 'merchant';
  text: string;
}

export interface StoreOrder {
  orderId: string;
  paypalTransactionId: string;
  customerName: string;
  items: StoreItem[];
  amount: number;
  currency: string;
  shippingAddress: StoreAddress;
  billingAddress: StoreAddress;
  orderedAt: string;
  carrier: string | null;
  trackingNumber: string | null;
  trackingEvents: TrackingEvent[];
  refunds: RefundRecord[];
  customerMessages: CustomerMessage[];
  listingDescription: string;
  returnPolicyText: string;
}

export interface PayPalMoney {
  currency_code: string;
  value: string;
}

export interface DisputedTransactionItem {
  item_name: string;
  item_description?: string;
  item_price?: PayPalMoney;
  item_quantity?: string;
}

export interface DisputedTransaction {
  seller_transaction_id: string;
  buyer_transaction_id?: string;
  transaction_status?: string;
  gross_amount?: PayPalMoney;
  buyer?: {
    name?: string;
  };
  seller_protection_eligible?: boolean;
  items?: DisputedTransactionItem[];
}

export interface DisputeMessage {
  posted_by: 'BUYER' | 'SELLER' | string;
  time: string;
  content: string;
}

export interface PayPalDispute {
  dispute_id: string;
  create_time: string;
  update_time: string;
  dispute_amount: PayPalMoney;
  status: string;
  dispute_state: string;
  dispute_lifecycle_stage: string;
  dispute_channel?: string;
  reason: DisputeReason | string;
  seller_response_due_date: string;
  disputed_transactions: DisputedTransaction[];
  messages?: DisputeMessage[];
}

export type EvidenceSource =
  | 'tracking'
  | 'order'
  | 'refund_history'
  | 'customer_messages'
  | 'paypal_dispute';

export interface EvidenceFact {
  id: string; // e.g. "F1", "F2"
  label: string;
  value: string;
  source: EvidenceSource;
}

export interface EvidencePack {
  facts: EvidenceFact[];
  missingItems: string[];
}

export type ScoreBand = 'strong' | 'medium' | 'weak';

export interface RubricItemResult {
  id: string;
  title: string;
  pointsPossible: number;
  pointsAwarded: number;
  passed: boolean;
  reason: string;
}

export interface ScoreResult {
  totalScore: number; // 0 - 100
  band: ScoreBand;
  disputeReason: StandardDisputeReason | 'UNKNOWN';
  breakdown: RubricItemResult[];
  summary: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  disputeId: string;
  action: 'submit-evidence' | 'accept' | 'offer';
  status: 'success' | 'failed';
  dryRun: boolean;
  payload?: Record<string, unknown>;
  response?: Record<string, unknown>;
  error?: string;
}
