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

export function addOrderRefund(
  txnIdOrOrderId: string,
  amount: number,
  reason: string
): StoreOrder | null {
  const orders = loadStoreOrders();
  const order = orders.find(
    (o) => o.orderId === txnIdOrOrderId || o.paypalTransactionId === txnIdOrOrderId
  );
  if (!order) return null;

  order.refunds.push({
    amount,
    date: new Date().toISOString(),
    reason,
  });

  try {
    if (fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error(`[Store] Error saving store.json:`, err);
  }

  return order;
}

export function resetStoreOrderRefunds(): void {
  const orders = loadStoreOrders(true);
  for (const o of orders) {
    if (o.orderId === 'ORD-1006') {
      o.refunds = [
        {
          amount: 50.0,
          date: '2026-10-24T16:00:00Z',
          reason: 'Goodwill discount for minor cosmetic scratch on skillet handle',
        },
      ];
    } else {
      o.refunds = [];
    }
  }
  try {
    if (fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify(orders, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error(`[Store] Error resetting store.json:`, err);
  }
}
