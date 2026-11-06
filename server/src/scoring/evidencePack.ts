import {
  EvidenceFact,
  EvidencePack,
  PayPalDispute,
  StoreOrder,
} from '../types/dispute.js';

export function buildEvidencePack(
  dispute: PayPalDispute,
  order?: StoreOrder | null
): EvidencePack {
  const facts: EvidenceFact[] = [];
  const missingItems: string[] = [];
  let factIndex = 1;

  const addFact = (
    label: string,
    value: string,
    source: EvidenceFact['source']
  ) => {
    facts.push({
      id: `F${factIndex++}`,
      label,
      value,
      source,
    });
  };

  // 1. Facts from PayPal Dispute
  addFact('Dispute ID', dispute.dispute_id, 'paypal_dispute');
  addFact(
    'Dispute Reason',
    dispute.reason,
    'paypal_dispute'
  );
  addFact(
    'Disputed Amount',
    `${dispute.dispute_amount.currency_code} ${dispute.dispute_amount.value}`,
    'paypal_dispute'
  );
  addFact(
    'Dispute Opened Date',
    new Date(dispute.create_time).toUTCString(),
    'paypal_dispute'
  );
  addFact(
    'Merchant Response Deadline',
    new Date(dispute.seller_response_due_date).toUTCString(),
    'paypal_dispute'
  );

  const txn = dispute.disputed_transactions?.[0];
  if (txn) {
    addFact('Transaction ID', txn.seller_transaction_id, 'paypal_dispute');
    if (txn.seller_protection_eligible !== undefined) {
      addFact(
        'Seller Protection Eligibility',
        txn.seller_protection_eligible ? 'Eligible' : 'Not Eligible',
        'paypal_dispute'
      );
    }
  }

  // 2. Facts from Store Order (if found)
  if (!order) {
    missingItems.push(
      'Matching store order record could not be found for this transaction ID'
    );
    return { facts, missingItems };
  }

  addFact('Store Order ID', order.orderId, 'order');
  addFact('Customer Name', order.customerName, 'order');
  addFact('Order Date', new Date(order.orderedAt).toUTCString(), 'order');

  const itemsList = order.items
    .map((item) => `${item.name} ($${item.price.toFixed(2)})`)
    .join(', ');
  addFact('Ordered Items', itemsList, 'order');

  const addr = `${order.shippingAddress.line1}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}, ${order.shippingAddress.countryCode}`;
  addFact('Shipping Address on File', addr, 'order');

  if (order.listingDescription) {
    addFact('Listing Description', order.listingDescription, 'order');
  } else {
    missingItems.push('Item listing description is missing from store catalog');
  }

  if (order.returnPolicyText) {
    addFact('Return Policy', order.returnPolicyText, 'order');
  } else {
    missingItems.push('Documented return policy text is missing');
  }

  // 3. Facts from Tracking
  if (order.trackingNumber && order.carrier) {
    addFact(
      'Tracking Number',
      `${order.carrier}: ${order.trackingNumber}`,
      'tracking'
    );

    const deliveryEvent = order.trackingEvents.find(
      (e) => e.status.toUpperCase() === 'DELIVERED'
    );

    if (deliveryEvent) {
      addFact(
        'Delivery Status',
        `DELIVERED on ${new Date(deliveryEvent.time).toUTCString()} at ${deliveryEvent.location}`,
        'tracking'
      );

      if (deliveryEvent.signedBy) {
        addFact(
          'Proof of Delivery Signature',
          `Signed by: ${deliveryEvent.signedBy}`,
          'tracking'
        );
      } else {
        missingItems.push('Physical signature confirmation on delivery');
      }
    } else {
      const latestEvent =
        order.trackingEvents[order.trackingEvents.length - 1];
      const statusText = latestEvent
        ? `${latestEvent.status} at ${latestEvent.location}`
        : 'In transit';
      addFact('Delivery Status', `Not yet delivered (${statusText})`, 'tracking');
      missingItems.push('Carrier delivery confirmation event');
    }
  } else {
    missingItems.push('Carrier name and valid tracking number');
  }

  // 4. Facts from Customer Messages
  if (order.customerMessages && order.customerMessages.length > 0) {
    const messagesSummary = order.customerMessages
      .map(
        (m) =>
          `[${new Date(m.time).toISOString().split('T')[0]} - ${m.from}]: "${m.text}"`
      )
      .join(' | ');
    addFact('Customer Message History', messagesSummary, 'customer_messages');
  } else {
    addFact('Customer Message History', 'No customer messages prior to dispute', 'customer_messages');
  }

  // 5. Facts from Refund History
  if (order.refunds && order.refunds.length > 0) {
    const refundSummary = order.refunds
      .map(
        (r) =>
          `$${r.amount.toFixed(2)} refunded on ${new Date(r.date).toISOString().split('T')[0]} (Reason: ${r.reason})`
      )
      .join('; ');
    addFact('Prior Refund History', refundSummary, 'refund_history');
  } else {
    addFact('Prior Refund History', 'No prior refunds or concessions recorded', 'refund_history');
  }

  return {
    facts,
    missingItems,
  };
}
