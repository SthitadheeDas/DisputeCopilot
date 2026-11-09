export type DataMode = 'sandbox' | 'fixture';

export interface HealthResponse {
  status: string;
  dataMode: DataMode;
  dryRun: boolean;
  ordersCount: number;
  disputesCount: number;
  timestamp: string;
}

export interface EvidenceFact {
  id: string;
  label: string;
  value: string;
  source: 'tracking' | 'order' | 'refund_history' | 'customer_messages' | 'paypal_dispute';
}

export interface EvidencePack {
  facts: EvidenceFact[];
  missingItems: string[];
}

export interface RubricItemResult {
  id: string;
  title: string;
  pointsPossible: number;
  pointsAwarded: number;
  passed: boolean;
  reason: string;
}

export type ScoreBand = 'strong' | 'medium' | 'weak';

export interface ScoreResult {
  totalScore: number;
  band: ScoreBand;
  disputeReason: string;
  breakdown: RubricItemResult[];
  summary: string;
}

export interface StoreOrder {
  orderId: string;
  paypalTransactionId: string;
  customerName: string;
  items: { name: string; description: string; price: number }[];
  amount: number;
  currency: string;
  orderedAt?: string;
  shippingAddress: {
    recipientName?: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
  };
  carrier: string | null;
  trackingNumber: string | null;
  trackingEvents: { time: string; status: string; location: string; signedBy?: string }[];
  refunds: { amount: number; date: string; reason: string }[];
  customerMessages: { time: string; from: 'customer' | 'merchant'; text: string }[];
  listingDescription: string;
  returnPolicyText: string;
}

export interface CachedAIAnalysis {
  disputeId: string;
  summary: string;
  recommendation: 'fight' | 'accept' | 'partial_offer';
  recommendedOfferAmount?: number;
  draftNotes: string;
  citedFactIds: string[];
  generatedAt: string;
  needsReview?: boolean;
}

export interface EnrichedDispute {
  dispute_id: string;
  create_time: string;
  update_time: string;
  dispute_amount: {
    currency_code: string;
    value: string;
  };
  status: string;
  dispute_state: string;
  dispute_lifecycle_stage: string;
  reason: string;
  seller_response_due_date: string;
  disputed_transactions: {
    seller_transaction_id: string;
    buyer?: { name?: string };
    items?: { item_name: string; item_description?: string }[];
  }[];
  messages?: { posted_by: string; time: string; content: string }[];
  matchedOrder: StoreOrder | null;
  evidencePack: EvidencePack;
  score: ScoreResult;
  hoursRemaining: number;
  cachedAnalysis?: CachedAIAnalysis | null;
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
