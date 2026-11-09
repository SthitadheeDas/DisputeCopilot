import * as s from "../core/validation/index.js";
import type { Schema } from "../core/validation/schema.js";
import { cachedAiAnalysisSchema, type CachedAiAnalysis } from "./cached-ai-analysis.js";
import { disputedTransactionSchema, type DisputedTransaction } from "./disputed-transaction.js";
import { evidencePackSchema, type EvidencePack } from "./evidence-pack.js";
import { moneySchema, type Money } from "./money.js";
import { scoreResultSchema, type ScoreResult } from "./score-result.js";
import { storeOrderSchema, type StoreOrder } from "./store-order.js";

export type EnrichedDispute = {
  disputeId: string;
  createTime: Date;
  updateTime: Date;
  disputeAmount: Money;
  status: string;
  disputeState?: string;
  disputeLifecycleStage?: string;
  reason: string;
  sellerResponseDueDate: Date;
  disputedTransactions?: DisputedTransaction[];
  matchedOrder?: StoreOrder | null;
  evidencePack: EvidencePack;
  score: ScoreResult;
  hoursRemaining: number;
  cachedAnalysis?: CachedAiAnalysis | null;
};

export const enrichedDisputeSchema: Schema<EnrichedDispute> = s.object<EnrichedDispute>({
  disputeId: s.string(),
  createTime: s.dateTime(),
  updateTime: s.dateTime(),
  disputeAmount: moneySchema,
  status: s.string(),
  disputeState: s.optional(s.string()),
  disputeLifecycleStage: s.optional(s.string()),
  reason: s.string(),
  sellerResponseDueDate: s.dateTime(),
  disputedTransactions: s.optional(s.array(s.lazy(() => disputedTransactionSchema))),
  matchedOrder: s.optionalNullable(s.lazy(() => storeOrderSchema)),
  evidencePack: evidencePackSchema,
  score: scoreResultSchema,
  hoursRemaining: s.int(),
  cachedAnalysis: s.optionalNullable(s.lazy(() => cachedAiAnalysisSchema)),
  _keysMap: {
    disputeId: "dispute_id",
    createTime: "create_time",
    updateTime: "update_time",
    disputeAmount: "dispute_amount",
    disputeState: "dispute_state",
    disputeLifecycleStage: "dispute_lifecycle_stage",
    sellerResponseDueDate: "seller_response_due_date",
    disputedTransactions: "disputed_transactions",
  },
});
