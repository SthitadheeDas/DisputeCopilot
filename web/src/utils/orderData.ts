import { EnrichedDispute } from '../types';
import { formatToGMT } from './date';
import { UnifiedTransactionRow } from '../components/AnalyticsTab';

export interface OrderItemDetail {
  name: string;
  sku: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface FulfillmentEvent {
  time: string;
  timeGmt: string;
  status: string;
  location: string;
  signedBy?: string;
}

export interface OrderDetailViewData {
  orderId: string;
  transactionId: string;
  date: string;
  dateGmt: string;
  paymentChannel: 'PayPal';
  disputeStatus: 'Clean' | 'Active' | 'Won' | 'Lost';
  disputeId?: string;
  disputeReason?: string;
  stakeAmount?: number;
  rawDispute?: EnrichedDispute;
  customerName: string;
  customerEmail: string;
  shippingAddress: {
    recipientName?: string;
    line1: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    isVerified: boolean;
  };
  items: OrderItemDetail[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  totalAmount: number;
  currency: string;
  carrier: string;
  trackingNumber: string;
  deliveryStatus: string;
  deliveredAtGmt?: string;
  signedBy?: string;
  trackingEvents: FulfillmentEvent[];
  ipLog: string;
  sessionId: string;
}

// Pool of realistic US addresses for clean lifetime transactions
const REALISTIC_ADDRESSES = [
  { line1: '1024 Market Street, Suite 400', city: 'San Francisco', state: 'CA', postalCode: '94103', countryCode: 'US' },
  { line1: '452 Elmwood Avenue', city: 'Buffalo', state: 'NY', postalCode: '14222', countryCode: 'US' },
  { line1: '819 North Michigan Avenue', city: 'Chicago', state: 'IL', postalCode: '60611', countryCode: 'US' },
  { line1: '1420 Peachtree Street NE', city: 'Atlanta', state: 'GA', postalCode: '30309', countryCode: 'US' },
  { line1: '2201 Westlake Avenue, Apt 8B', city: 'Seattle', state: 'WA', postalCode: '98121', countryCode: 'US' },
  { line1: '1100 Congress Avenue', city: 'Austin', state: 'TX', postalCode: '78701', countryCode: 'US' },
  { line1: '500 Boylston Street, Floor 12', city: 'Boston', state: 'MA', postalCode: '02116', countryCode: 'US' },
  { line1: '777 South Figueroa Street', city: 'Los Angeles', state: 'CA', postalCode: '90017', countryCode: 'US' },
  { line1: '350 Fifth Avenue, Suite 2100', city: 'New York', state: 'NY', postalCode: '10118', countryCode: 'US' },
  { line1: '200 East Las Olas Boulevard', city: 'Fort Lauderdale', state: 'FL', postalCode: '33301', countryCode: 'US' },
  { line1: '601 13th Street NW, Suite 900', city: 'Washington', state: 'DC', postalCode: '20005', countryCode: 'US' },
  { line1: '1801 California Street', city: 'Denver', state: 'CO', postalCode: '80202', countryCode: 'US' },
];

/**
 * Builds unified, comprehensive order details from any transaction row (disputed or clean)
 * All timestamps are strictly formatted to GMT/UTC.
 */
export function buildOrderDetailViewData(row: UnifiedTransactionRow): OrderDetailViewData {
  const matched = row.rawDispute?.matchedOrder;

  if (matched) {
    // 1. Transaction backed by matched StoreOrder in data/store.json
    const orderDate = matched.orderedAt || row.date;
    const trackingEvents: FulfillmentEvent[] = (matched.trackingEvents || []).map((ev) => ({
      time: ev.time,
      timeGmt: formatToGMT(ev.time),
      status: ev.status,
      location: ev.location,
      signedBy: ev.signedBy,
    }));

    const deliveredEv = trackingEvents.find((e) => e.status === 'DELIVERED');
    const deliveryStatus = deliveredEv
      ? 'DELIVERED'
      : trackingEvents.length > 0
      ? trackingEvents[trackingEvents.length - 1].status
      : matched.trackingNumber
      ? 'IN_TRANSIT'
      : 'UNTRACKED_STANDARD';

    const orderNum = parseInt(matched.orderId.replace(/\D/g, '') || '1000', 10);
    const ipSuffix = (orderNum % 180) + 20;

    const items: OrderItemDetail[] = matched.items.map((item, idx) => ({
      name: item.name,
      sku: `SKU-${matched.orderId.replace(/[^0-9]/g, '')}${idx > 0 ? `-${idx + 1}` : ''}`,
      description: item.description,
      quantity: 1,
      unitPrice: item.price,
      totalPrice: item.price,
    }));

    return {
      orderId: matched.orderId,
      transactionId: row.transactionId,
      date: orderDate,
      dateGmt: formatToGMT(orderDate),
      paymentChannel: 'PayPal',
      disputeStatus: row.disputeStatus,
      disputeId: row.disputeId,
      disputeReason: row.rawDispute?.reason,
      stakeAmount: row.stakeAmount,
      rawDispute: row.rawDispute,
      customerName: matched.customerName,
      customerEmail: `${matched.customerName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
      shippingAddress: {
        recipientName: matched.shippingAddress.recipientName || matched.customerName,
        line1: matched.shippingAddress.line1,
        city: matched.shippingAddress.city,
        state: matched.shippingAddress.state,
        postalCode: matched.shippingAddress.postalCode,
        countryCode: matched.shippingAddress.countryCode,
        isVerified: true,
      },
      items,
      subtotal: matched.amount,
      shippingCost: 0,
      tax: 0,
      totalAmount: matched.amount,
      currency: matched.currency || row.currency || 'USD',
      carrier: matched.carrier || 'UPS',
      trackingNumber: matched.trackingNumber || 'N/A',
      deliveryStatus,
      deliveredAtGmt: deliveredEv?.timeGmt,
      signedBy: deliveredEv?.signedBy,
      trackingEvents,
      ipLog: `IP: 198.51.100.${ipSuffix} • TLS 1.3 • PayPal Token ID: PAYID-${matched.orderId}-AUTH • Geolocation: ${matched.shippingAddress.city}, ${matched.shippingAddress.state}, ${matched.shippingAddress.countryCode}`,
      sessionId: `SESS-${row.transactionId.replace(/[^a-zA-Z0-9]/g, '')}-01`,
    };
  }

  // 2. Clean Lifetime Transaction (from LIFETIME_CLEAN_TRANSACTIONS)
  const orderNum = parseInt(row.orderId.replace(/\D/g, '') || '950', 10);
  const addr = REALISTIC_ADDRESSES[orderNum % REALISTIC_ADDRESSES.length];
  const carriers = ['UPS', 'FedEx', 'USPS Priority', 'DHL Express'];
  const carrier = carriers[orderNum % carriers.length];

  const trackingNumber =
    carrier === 'UPS'
      ? `1Z99999999${(orderNum * 17) % 9000000 + 1000000}`
      : carrier === 'FedEx'
      ? `79482910${(orderNum * 23) % 9000 + 1000}`
      : carrier === 'USPS Priority'
      ? `940011189922${(orderNum * 31) % 90000000 + 10000000}`
      : `12345678${(orderNum * 13) % 90 + 10}`;

  const orderTime = new Date(row.date).getTime();
  const pickUpTime = new Date(orderTime + 14 * 3600 * 1000).toISOString();
  const transitTime = new Date(orderTime + 32 * 3600 * 1000).toISOString();
  const deliveredTime = new Date(orderTime + 48 * 3600 * 1000).toISOString();
  const initials = row.customer
    .split(' ')
    .map((n) => n[0])
    .join('. ');

  const trackingEvents: FulfillmentEvent[] = [
    {
      time: pickUpTime,
      timeGmt: formatToGMT(pickUpTime),
      status: 'PICKED_UP',
      location: `${addr.city} Distribution Hub, ${addr.state}`,
    },
    {
      time: transitTime,
      timeGmt: formatToGMT(transitTime),
      status: 'IN_TRANSIT',
      location: `${addr.city} Sort Facility, ${addr.state}`,
    },
    {
      time: deliveredTime,
      timeGmt: formatToGMT(deliveredTime),
      status: 'DELIVERED',
      location: `${addr.city}, ${addr.state}`,
      signedBy: `${initials} (Front Door / Reception)`,
    },
  ];

  const ipSuffix = (orderNum % 180) + 20;

  const items: OrderItemDetail[] = [
    {
      name: row.itemDescription || 'Verified Merchant Merchandise',
      sku: `SKU-${row.orderId.replace(/[^0-9]/g, '')}`,
      description: 'Authentic merchant product fulfilled with verified tracked parcel delivery.',
      quantity: 1,
      unitPrice: row.grossAmount,
      totalPrice: row.grossAmount,
    },
  ];

  return {
    orderId: row.orderId,
    transactionId: row.transactionId,
    date: row.date,
    dateGmt: formatToGMT(row.date),
    paymentChannel: 'PayPal',
    disputeStatus: 'Clean',
    customerName: row.customer,
    customerEmail: `${row.customer.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`,
    shippingAddress: {
      recipientName: row.customer,
      line1: addr.line1,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      countryCode: addr.countryCode,
      isVerified: true,
    },
    items,
    subtotal: row.grossAmount,
    shippingCost: 0,
    tax: 0,
    totalAmount: row.grossAmount,
    currency: row.currency || 'USD',
    carrier,
    trackingNumber,
    deliveryStatus: 'DELIVERED',
    deliveredAtGmt: formatToGMT(deliveredTime),
    signedBy: `${initials} (Front Door / Reception)`,
    trackingEvents,
    ipLog: `IP: 198.51.100.${ipSuffix} • TLS 1.3 • PayPal Token ID: PAYID-${row.orderId}-AUTH • Geolocation: ${addr.city}, ${addr.state}, ${addr.countryCode}`,
    sessionId: `SESS-${row.transactionId}-AUTH`,
  };
}
