import fs from 'fs';
import { FIXTURES_FILE } from '../config.js';
import { PayPalDispute } from '../types/dispute.js';

let cachedFixtures: PayPalDispute[] | null = null;

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
    cachedFixtures = JSON.parse(raw) as PayPalDispute[];
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
