import { describe, it, expect } from 'vitest';
import { scoreDispute, buildEvidencePack, getScoreBand } from '../index.js';
import { PayPalDispute, StoreOrder } from '../../types/dispute.js';

describe('Scoring Engine - Band Classification', () => {
  it('correctly maps scores to bands', () => {
    expect(getScoreBand(100)).toBe('strong');
    expect(getScoreBand(70)).toBe('strong');
    expect(getScoreBand(69)).toBe('medium');
    expect(getScoreBand(40)).toBe('medium');
    expect(getScoreBand(39)).toBe('weak');
    expect(getScoreBand(0)).toBe('weak');
  });
});

describe('Scoring Engine - ITEM_NOT_RECEIVED (INR)', () => {
  const baseDispute: PayPalDispute = {
    dispute_id: 'PP-D-TEST-1',
    create_time: '2026-11-01T12:00:00Z',
    update_time: '2026-11-01T12:00:00Z',
    dispute_amount: { currency_code: 'USD', value: '150.00' },
    status: 'WAITING_FOR_SELLER_RESPONSE',
    dispute_state: 'REQUIRED_ACTION',
    dispute_lifecycle_stage: 'INQUIRY',
    reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    seller_response_due_date: '2026-11-10T12:00:00Z',
    disputed_transactions: [
      {
        seller_transaction_id: 'TXN-TEST-1',
        buyer_transaction_id: 'BUYER-1',
        transaction_status: 'COMPLETED',
        gross_amount: { currency_code: 'USD', value: '150.00' },
        buyer: { name: 'Alice Smith' },
        seller_protection_eligible: true,
      },
    ],
  };

  const perfectOrder: StoreOrder = {
    orderId: 'ORD-TEST-1',
    paypalTransactionId: 'TXN-TEST-1',
    customerName: 'Alice Smith',
    items: [{ name: 'Test Product', description: 'Brand new item', price: 150.0 }],
    amount: 150.0,
    currency: 'USD',
    shippingAddress: {
      recipientName: 'Alice Smith',
      line1: '123 Main St',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      countryCode: 'US',
    },
    billingAddress: {
      recipientName: 'Alice Smith',
      line1: '123 Main St',
      city: 'Portland',
      state: 'OR',
      postalCode: '97201',
      countryCode: 'US',
    },
    orderedAt: '2026-10-25T10:00:00Z',
    carrier: 'UPS',
    trackingNumber: '1Z123456789',
    trackingEvents: [
      {
        time: '2026-10-28T14:00:00Z', // Before dispute date
        status: 'DELIVERED',
        location: 'Portland, OR',
        signedBy: 'A. Smith',
      },
    ],
    refunds: [],
    customerMessages: [
      {
        time: '2026-10-29T10:00:00Z', // After delivery
        from: 'customer',
        text: 'Where is my order?',
      },
    ],
    listingDescription: 'Authentic brand new item in box.',
    returnPolicyText: '30 days return.',
  };

  it('scores 100 (strong) for full evidence with delivery signature and no prior refund', () => {
    const result = scoreDispute(baseDispute, perfectOrder);
    expect(result.totalScore).toBe(100);
    expect(result.band).toBe('strong');
    expect(result.breakdown.every((item) => item.passed)).toBe(true);
  });

  it('also accepts ITEM_NOT_RECEIVED alias', () => {
    const aliasedDispute: PayPalDispute = {
      ...baseDispute,
      reason: 'ITEM_NOT_RECEIVED',
    };
    const result = scoreDispute(aliasedDispute, perfectOrder);
    expect(result.totalScore).toBe(100);
    expect(result.band).toBe('strong');
    expect(result.disputeReason).toBe('MERCHANDISE_OR_SERVICE_NOT_RECEIVED');
  });

  it('deducts 15 points if delivery was without signature (score 85, strong)', () => {
    const orderNoSig: StoreOrder = {
      ...perfectOrder,
      trackingEvents: [
        {
          time: '2026-10-28T14:00:00Z',
          status: 'DELIVERED',
          location: 'Portland, OR',
          // No signedBy
        },
      ],
    };

    const result = scoreDispute(baseDispute, orderNoSig);
    expect(result.totalScore).toBe(85);
    expect(result.band).toBe('strong');
    const sigCheck = result.breakdown.find(
      (b) => b.id === 'INR_SIGNATURE_ON_DELIVERY'
    );
    expect(sigCheck?.passed).toBe(false);
  });

  it('scores weak when tracking number is missing', () => {
    const orderNoTracking: StoreOrder = {
      ...perfectOrder,
      carrier: null,
      trackingNumber: null,
      trackingEvents: [],
      customerMessages: [], // No complaints
    };

    const result = scoreDispute(baseDispute, orderNoTracking);
    // Passes address (+15), no pre-delivery complaint (+5), no prior refund (+5) = 25 points
    expect(result.totalScore).toBe(25);
    expect(result.band).toBe('weak');
  });

  it('deducts 5 points when customer complained before delivery', () => {
    const orderEarlyComplaint: StoreOrder = {
      ...perfectOrder,
      customerMessages: [
        {
          time: '2026-10-27T10:00:00Z', // Before delivery on Oct 28
          from: 'customer',
          text: 'Where is my order? Delayed!',
        },
      ],
    };

    const result = scoreDispute(baseDispute, orderEarlyComplaint);
    expect(result.totalScore).toBe(95);
    const complaintCheck = result.breakdown.find(
      (b) => b.id === 'INR_NO_PRE_DELIVERY_COMPLAINT'
    );
    expect(complaintCheck?.passed).toBe(false);
  });

  it('deducts 5 points when prior refund exists', () => {
    const orderRefunded: StoreOrder = {
      ...perfectOrder,
      refunds: [
        { amount: 50, date: '2026-10-29T10:00:00Z', reason: 'Courtesy refund' },
      ],
    };

    const result = scoreDispute(baseDispute, orderRefunded);
    expect(result.totalScore).toBe(95);
    const refundCheck = result.breakdown.find(
      (b) => b.id === 'INR_NO_PRIOR_REFUND'
    );
    expect(refundCheck?.passed).toBe(false);
  });
});

describe('Scoring Engine - NOT_AS_DESCRIBED (SNAD)', () => {
  const baseSnadDispute: PayPalDispute = {
    dispute_id: 'PP-D-TEST-2',
    create_time: '2026-11-02T10:00:00Z',
    update_time: '2026-11-02T10:00:00Z',
    dispute_amount: { currency_code: 'USD', value: '200.00' },
    status: 'WAITING_FOR_SELLER_RESPONSE',
    dispute_state: 'REQUIRED_ACTION',
    dispute_lifecycle_stage: 'INQUIRY',
    reason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
    seller_response_due_date: '2026-11-12T10:00:00Z',
    disputed_transactions: [
      {
        seller_transaction_id: 'TXN-TEST-2',
        gross_amount: { currency_code: 'USD', value: '200.00' },
      },
    ],
  };

  const perfectSnadOrder: StoreOrder = {
    orderId: 'ORD-TEST-2',
    paypalTransactionId: 'TXN-TEST-2',
    customerName: 'Bob Vance',
    items: [{ name: 'Ergonomic Chair', description: 'High-back mesh chair', price: 200.0 }],
    amount: 200.0,
    currency: 'USD',
    shippingAddress: {
      recipientName: 'Bob Vance',
      line1: '456 Oak Lane',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      countryCode: 'US',
    },
    billingAddress: {
      recipientName: 'Bob Vance',
      line1: '456 Oak Lane',
      city: 'Austin',
      state: 'TX',
      postalCode: '78701',
      countryCode: 'US',
    },
    orderedAt: '2026-10-20T10:00:00Z',
    carrier: 'FedEx',
    trackingNumber: '794800000000',
    trackingEvents: [
      {
        time: '2026-10-24T12:00:00Z',
        status: 'DELIVERED',
        location: 'Austin, TX',
        signedBy: 'B. Vance',
      },
    ],
    refunds: [],
    customerMessages: [
      {
        time: '2026-10-26T14:00:00Z',
        from: 'customer',
        text: 'This chair is not the color I wanted.',
      },
    ],
    listingDescription: 'Authentic Ergonomic Chair brand new sealed condition with detailed specification photos.',
    returnPolicyText: '14-day return policy for items in original condition. Return shipping paid by buyer.',
  };

  it('scores 100 (strong) when listing matches, return policy exists, delivery confirmed, and no prior refund', () => {
    const result = scoreDispute(baseSnadDispute, perfectSnadOrder);
    expect(result.totalScore).toBe(100);
    expect(result.band).toBe('strong');
    expect(result.breakdown.every((item) => item.passed)).toBe(true);
  });

  it('also accepts NOT_AS_DESCRIBED alias', () => {
    const aliasedDispute: PayPalDispute = {
      ...baseSnadDispute,
      reason: 'NOT_AS_DESCRIBED',
    };
    const result = scoreDispute(aliasedDispute, perfectSnadOrder);
    expect(result.totalScore).toBe(100);
    expect(result.band).toBe('strong');
    expect(result.disputeReason).toBe('MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED');
  });

  it('deducts 10 points when prior partial refund or goodwill offer exists (score 90, strong)', () => {
    const orderWithPartialRefund: StoreOrder = {
      ...perfectSnadOrder,
      refunds: [
        {
          amount: 50,
          date: '2026-10-25T10:00:00Z',
          reason: 'Goodwill discount for box scratch',
        },
      ],
    };

    const result = scoreDispute(baseSnadDispute, orderWithPartialRefund);
    expect(result.totalScore).toBe(90);
    expect(result.band).toBe('strong');
    const refundCheck = result.breakdown.find(
      (b) => b.id === 'SNAD_NO_PRIOR_REFUND_OR_OFFER'
    );
    expect(refundCheck?.passed).toBe(false);
  });

  it('deducts 15 points if return policy is missing (score 85, strong)', () => {
    const orderNoPolicy: StoreOrder = {
      ...perfectSnadOrder,
      returnPolicyText: '',
    };

    const result = scoreDispute(baseSnadDispute, orderNoPolicy);
    expect(result.totalScore).toBe(85);
    const policyCheck = result.breakdown.find(
      (b) => b.id === 'SNAD_RETURN_POLICY'
    );
    expect(policyCheck?.passed).toBe(false);
  });
});

describe('Evidence Pack Generator', () => {
  it('correctly compiles facts and flags missing items when tracking is missing', () => {
    const dispute: PayPalDispute = {
      dispute_id: 'PP-D-TEST-3',
      create_time: '2026-11-01T10:00:00Z',
      update_time: '2026-11-01T10:00:00Z',
      dispute_amount: { currency_code: 'USD', value: '45.00' },
      status: 'WAITING_FOR_SELLER_RESPONSE',
      dispute_state: 'REQUIRED_ACTION',
      dispute_lifecycle_stage: 'INQUIRY',
      reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
      seller_response_due_date: '2026-11-10T10:00:00Z',
      disputed_transactions: [
        {
          seller_transaction_id: 'TXN-NO-TRACK',
        },
      ],
    };

    const orderNoTracking: StoreOrder = {
      orderId: 'ORD-NO-TRACK',
      paypalTransactionId: 'TXN-NO-TRACK',
      customerName: 'Sam Green',
      items: [{ name: 'Sticker Pack', description: 'Vinyl stickers', price: 45.0 }],
      amount: 45.0,
      currency: 'USD',
      shippingAddress: {
        line1: '10 Market St',
        city: 'Denver',
        state: 'CO',
        postalCode: '80202',
        countryCode: 'US',
      },
      billingAddress: {
        line1: '10 Market St',
        city: 'Denver',
        state: 'CO',
        postalCode: '80202',
        countryCode: 'US',
      },
      orderedAt: '2026-10-20T10:00:00Z',
      carrier: null,
      trackingNumber: null,
      trackingEvents: [],
      refunds: [],
      customerMessages: [],
      listingDescription: 'Handmade stickers.',
      returnPolicyText: 'All sales final.',
    };

    const pack = buildEvidencePack(dispute, orderNoTracking);
    expect(pack.facts.length).toBeGreaterThan(0);
    expect(pack.missingItems).toContain('Carrier name and valid tracking number');
  });

  it('handles missing order gracefully', () => {
    const dispute: PayPalDispute = {
      dispute_id: 'PP-D-TEST-4',
      create_time: '2026-11-01T10:00:00Z',
      update_time: '2026-11-01T10:00:00Z',
      dispute_amount: { currency_code: 'USD', value: '10.00' },
      status: 'WAITING_FOR_SELLER_RESPONSE',
      dispute_state: 'REQUIRED_ACTION',
      dispute_lifecycle_stage: 'INQUIRY',
      reason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
      seller_response_due_date: '2026-11-10T10:00:00Z',
      disputed_transactions: [{ seller_transaction_id: 'NON_EXISTENT_TXN' }],
    };

    const pack = buildEvidencePack(dispute, null);
    expect(pack.facts.length).toBeGreaterThan(0);
    expect(pack.missingItems[0]).toContain('could not be found');
  });
});
