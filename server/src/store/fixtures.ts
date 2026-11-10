import fs from 'fs';
import { FIXTURES_FILE } from '../config.js';
import { PayPalDispute } from '../types/dispute.js';

let cachedFixtures: PayPalDispute[] | null = null;

// Staggered deadline offsets in days from Date.now() (+3 to +8 days out)
// Ensures active disputes never show as Overdue during hackathon evaluation
const DEADLINE_OFFSETS_DAYS = [3, 5, 6, 4, 7, 8];

function applyDynamicDeadlines(disputes: PayPalDispute[]): PayPalDispute[] {
  const now = Date.now();
  disputes.forEach((d, idx) => {
    // Only adjust active claims needing seller response
    if (d.status === 'WAITING_FOR_SELLER_RESPONSE' || !d.seller_response_due_date) {
      const days = DEADLINE_OFFSETS_DAYS[idx % DEADLINE_OFFSETS_DAYS.length];
      const dynamicDue = new Date(now + days * 24 * 60 * 60 * 1000);
      dynamicDue.setUTCHours(18, 0, 0, 0);
      d.seller_response_due_date = dynamicDue.toISOString();
    }
  });
  return disputes;
}

export function loadFixtureDisputes(reload = false): PayPalDispute[] {
  if (cachedFixtures && !reload) {
    return cachedFixtures;
  }

  try {
    if (!fs.existsSync(FIXTURES_FILE)) {
      console.warn(`[Fixtures] disputes.json not found at ${FIXTURES_FILE}`);
      return [];
    }
    const raw = fs.readFileSync(FIXTURES_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as PayPalDispute[];
    cachedFixtures = applyDynamicDeadlines(parsed);
    return cachedFixtures;
  } catch (err) {
    console.error(`[Fixtures] Error reading disputes.json:`, err);
    return [];
  }
}

export function findFixtureDisputeById(
  disputeId: string
): PayPalDispute | null {
  const disputes = loadFixtureDisputes();
  return disputes.find((d) => d.dispute_id === disputeId) || null;
}

export function updateFixtureDispute(
  disputeId: string,
  updates: Partial<PayPalDispute>
): PayPalDispute | null {
  const disputes = loadFixtureDisputes();
  const dispute = disputes.find((d) => d.dispute_id === disputeId);
  if (!dispute) return null;

  Object.assign(dispute, updates, {
    update_time: new Date().toISOString(),
  });

  try {
    if (fs.existsSync(FIXTURES_FILE)) {
      fs.writeFileSync(FIXTURES_FILE, JSON.stringify(disputes, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error(`[Fixtures] Error updating fixtures file:`, err);
  }

  return dispute;
}

export function resetFixtureDisputes(): PayPalDispute[] {
  const disputes = loadFixtureDisputes(true);
  for (const d of disputes) {
    d.status = 'WAITING_FOR_SELLER_RESPONSE';
    d.dispute_state = 'REQUIRED_ACTION';
    d.dispute_lifecycle_stage = 'INQUIRY';
    d.update_time = new Date().toISOString();
  }
  applyDynamicDeadlines(disputes);

  try {
    if (fs.existsSync(FIXTURES_FILE)) {
      fs.writeFileSync(FIXTURES_FILE, JSON.stringify(disputes, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error(`[Fixtures] Error resetting fixtures file:`, err);
  }

  return disputes;
}
