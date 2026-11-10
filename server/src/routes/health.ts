import { Router } from 'express';
import { CONFIG } from '../config.js';
import { loadStoreOrders } from '../store/store.js';
import { loadFixtureDisputes } from '../store/fixtures.js';

const router = Router();

router.get('/health', (_req, res) => {
  const orders = loadStoreOrders();
  const disputes = loadFixtureDisputes();

  res.json({
    status: 'ok',
    dataMode: CONFIG.dataMode,
    dryRun: CONFIG.dryRun,
    geminiModel: CONFIG.gemini.model,
    groqModel: CONFIG.groq.model,
    hasPayPalCredentials: Boolean(CONFIG.paypal.clientId && CONFIG.paypal.clientSecret),
    hasGeminiKey: Boolean(CONFIG.gemini.apiKey),
    hasGroqKey: Boolean(CONFIG.groq.apiKey),
    ordersCount: orders.length,
    disputesCount: disputes.length,
    timestamp: new Date().toISOString(),
  });
});

export default router;
