import fs from 'fs';
import { STORE_FILE } from '../config.js';
import { StoreOrder } from '../types/dispute.js';

let cachedOrders: StoreOrder[] | null = null;

export function loadStoreOrders(reload = false): StoreOrder[] {
  if (cachedOrders && !reload) {
    return cachedOrders;
  }

  try {
    if (!fs.existsSync(STORE_FILE)) {
      console.warn(`[Store] store.json not found at ${STORE_FILE}`);
      return [];
    }
    const raw = fs.readFileSync(STORE_FILE, 'utf-8');
    cachedOrders = JSON.parse(raw) as StoreOrder[];
    return cachedOrders;
  } catch (err) {
    console.error(`[Store] Error reading store.json:`, err);
    return [];
  }
}

export function findOrderByTransactionId(
  txnId: string
): StoreOrder | null {
  const orders = loadStoreOrders();
  return orders.find((o) => o.paypalTransactionId === txnId) || null;
}

export function findOrderByOrderId(orderId: string): StoreOrder | null {
  const orders = loadStoreOrders();
  return orders.find((o) => o.orderId === orderId) || null;
}
