import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Try loading .env from project root or current directory
const possibleEnvPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), '..', '.env'),
];

for (const envPath of possibleEnvPaths) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    break;
  }
}

// Locate project root directory (where package.json and /data live)
function resolveProjectRoot(): string {
  let curr = process.cwd();
  for (let i = 0; i < 4; i++) {
    if (fs.existsSync(path.join(curr, 'data', 'store.json'))) {
      return curr;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }
  return process.cwd();
}

export const PROJECT_ROOT = resolveProjectRoot();
export const DATA_DIR = path.join(PROJECT_ROOT, 'data');
export const STORE_FILE = path.join(DATA_DIR, 'store.json');
export const FIXTURES_FILE = path.join(DATA_DIR, 'fixtures', 'disputes.json');
export const ANALYSIS_CACHE_FILE = path.join(DATA_DIR, 'analysis-cache.json');
export const ACTIVITY_LOG_FILE = path.join(DATA_DIR, 'activity-log.json');

export const CONFIG = {
  port: parseInt(process.env.PORT || '3000', 10),
  dataMode: (process.env.DATA_MODE?.toLowerCase() === 'sandbox' ? 'sandbox' : 'fixture') as 'sandbox' | 'fixture',
  dryRun: process.env.DRY_RUN !== 'false', // Defaults to true for safety
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    baseUrl: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model:
      process.env.GEMINI_MODEL &&
      !['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash'].includes(process.env.GEMINI_MODEL)
        ? process.env.GEMINI_MODEL
        : 'gemini-3.8-flash',
  },
};
