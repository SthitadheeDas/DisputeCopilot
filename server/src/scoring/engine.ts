import {
  PayPalDispute,
  RubricItemResult,
  ScoreResult,
  StandardDisputeReason,
  StoreOrder,
} from '../types/dispute.js';
import {
  getScoreBand,
  INR_RUBRIC_WEIGHTS,
  SNAD_RUBRIC_WEIGHTS,
} from './weights.js';

export function normalizeDisputeReason(
  reason: string
): StandardDisputeReason | 'UNKNOWN' {
  const upper = reason.toUpperCase().trim();
  if (
    upper === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED' ||
    upper === 'ITEM_NOT_RECEIVED' ||
    upper === 'INR'
  ) {
    return 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED';
  }
  if (
    upper === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED' ||
    upper === 'NOT_AS_DESCRIBED' ||
    upper === 'SNAD'
  ) {
    return 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED';
  }
  return 'UNKNOWN';
}

export function scoreDispute(
  dispute: PayPalDispute,
  order?: StoreOrder | null
): ScoreResult {
  const standardReason = normalizeDisputeReason(dispute.reason);

  if (standardReason === 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED') {
    return scoreItemNotReceived(dispute, order);
  }

  if (standardReason === 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED') {
    return scoreNotAsDescribed(dispute, order);
  }

  // Fallback for unknown reasons
  return {
    totalScore: 0,
    band: 'weak',
    disputeReason: 'UNKNOWN',
    breakdown: [],
    summary: `Unsupported dispute reason: ${dispute.reason}`,
  };
}

function scoreItemNotReceived(
  dispute: PayPalDispute,
  order?: StoreOrder | null
): ScoreResult {
  const breakdown: RubricItemResult[] = [];
  let totalScore = 0;

  const disputeDate = new Date(dispute.create_time).getTime();
  const deliveryEvent = order?.trackingEvents?.find(
    (e) => e.status.toUpperCase() === 'DELIVERED'
  );
  const deliveryTime = deliveryEvent
    ? new Date(deliveryEvent.time).getTime()
    : null;

  // 1. Tracking number exists (+20)
  const hasTracking = Boolean(order?.trackingNumber && order?.carrier);
  const w1 = INR_RUBRIC_WEIGHTS.find((w) => w.id === 'INR_TRACKING_EXISTS')!;
  if (hasTracking) {
    totalScore += w1.points;
    breakdown.push({
      id: w1.id,
      title: w1.title,
      pointsPossible: w1.points,
      pointsAwarded: w1.points,
      passed: true,
      reason: `Tracking provided with ${order?.carrier}: ${order?.trackingNumber}`,
    });
  } else {
    breakdown.push({
      id: w1.id,
      title: w1.title,
      pointsPossible: w1.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'No carrier tracking number associated with this order.',
    });
  }

  // 2. Carrier status delivered (+30)
  const isDelivered = Boolean(deliveryEvent);
  const w2 = INR_RUBRIC_WEIGHTS.find((w) => w.id === 'INR_STATUS_DELIVERED')!;
  if (isDelivered) {
    totalScore += w2.points;
    breakdown.push({
      id: w2.id,
      title: w2.title,
      pointsPossible: w2.points,
      pointsAwarded: w2.points,
      passed: true,
      reason: `Confirmed delivered at ${deliveryEvent?.location || 'destination'}`,
    });
  } else {
    breakdown.push({
      id: w2.id,
      title: w2.title,
      pointsPossible: w2.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'Tracking does not indicate final delivery to buyer.',
    });
  }

  // 3. Delivered before dispute date (+10)
  const w3 = INR_RUBRIC_WEIGHTS.find(
    (w) => w.id === 'INR_DELIVERED_BEFORE_DISPUTE'
  )!;
  if (deliveryTime && deliveryTime <= disputeDate) {
    totalScore += w3.points;
    breakdown.push({
      id: w3.id,
      title: w3.title,
      pointsPossible: w3.points,
      pointsAwarded: w3.points,
      passed: true,
      reason: `Package delivered on ${new Date(deliveryTime).toISOString().split('T')[0]}, before dispute opened on ${new Date(disputeDate).toISOString().split('T')[0]}`,
    });
  } else {
    breakdown.push({
      id: w3.id,
      title: w3.title,
      pointsPossible: w3.points,
      pointsAwarded: 0,
      passed: false,
      reason: deliveryTime
        ? 'Delivery timestamp is after or on the dispute creation time.'
        : 'Cannot verify delivery date relative to dispute date.',
    });
  }

  // 4. Signature on delivery (+15)
  const w4 = INR_RUBRIC_WEIGHTS.find(
    (w) => w.id === 'INR_SIGNATURE_ON_DELIVERY'
  )!;
  const hasSignature = Boolean(deliveryEvent?.signedBy);
  if (hasSignature) {
    totalScore += w4.points;
    breakdown.push({
      id: w4.id,
      title: w4.title,
      pointsPossible: w4.points,
      pointsAwarded: w4.points,
      passed: true,
      reason: `Delivery signed by recipient: ${deliveryEvent?.signedBy}`,
    });
  } else {
    breakdown.push({
      id: w4.id,
      title: w4.title,
      pointsPossible: w4.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'No recipient signature recorded on delivery.',
    });
  }

  // 5. Delivery address matches transaction shipping address (+15)
  const w5 = INR_RUBRIC_WEIGHTS.find((w) => w.id === 'INR_ADDRESS_MATCHES')!;
  const deliveryLocation = deliveryEvent?.location?.trim();
  const shippingCity = order?.shippingAddress?.city?.trim();
  const shippingState = order?.shippingAddress?.state?.trim();

  if (!deliveryLocation || !shippingCity || !shippingState) {
    breakdown.push({
      id: w5.id,
      title: w5.title,
      pointsPossible: w5.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'Missing delivery location or order shipping address data.',
    });
  } else {
    const locLower = deliveryLocation.toLowerCase();
    const cityLower = shippingCity.toLowerCase();
    const stateLower = shippingState.toLowerCase();

    const containsCity = locLower.includes(cityLower);
    const stateEscaped = shippingState.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const stateRegex = new RegExp(`(^|[^a-zA-Z0-9])${stateEscaped}([^a-zA-Z0-9]|$)`, 'i');
    const containsState = stateRegex.test(deliveryLocation) || (shippingState.length > 2 && locLower.includes(stateLower));

    if (containsCity && containsState) {
      totalScore += w5.points;
      breakdown.push({
        id: w5.id,
        title: w5.title,
        pointsPossible: w5.points,
        pointsAwarded: w5.points,
        passed: true,
        reason: `Delivery location (${deliveryLocation}) matches order shipping address (${shippingCity}, ${shippingState}).`,
      });
    } else {
      breakdown.push({
        id: w5.id,
        title: w5.title,
        pointsPossible: w5.points,
        pointsAwarded: 0,
        passed: false,
        reason: `Delivery location (${deliveryLocation}) does not match order shipping address (${shippingCity}, ${shippingState}).`,
      });
    }
  }

  // 6. No customer complaint messages before delivery (+5)
  const w6 = INR_RUBRIC_WEIGHTS.find(
    (w) => w.id === 'INR_NO_PRE_DELIVERY_COMPLAINT'
  )!;
  const preDeliveryComplaint = order?.customerMessages?.some((msg) => {
    if (msg.from !== 'customer') return false;
    const msgTime = new Date(msg.time).getTime();
    return deliveryTime ? msgTime < deliveryTime : true;
  });
  if (!preDeliveryComplaint) {
    totalScore += w6.points;
    breakdown.push({
      id: w6.id,
      title: w6.title,
      pointsPossible: w6.points,
      pointsAwarded: w6.points,
      passed: true,
      reason: 'No customer dispute or complaint messages sent before delivery.',
    });
  } else {
    breakdown.push({
      id: w6.id,
      title: w6.title,
      pointsPossible: w6.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'Customer initiated communication or complaint prior to delivery.',
    });
  }

  // 7. No prior refund (+5)
  const w7 = INR_RUBRIC_WEIGHTS.find((w) => w.id === 'INR_NO_PRIOR_REFUND')!;
  const hasPriorRefund = Boolean(order?.refunds && order.refunds.length > 0);
  if (!hasPriorRefund) {
    totalScore += w7.points;
    breakdown.push({
      id: w7.id,
      title: w7.title,
      pointsPossible: w7.points,
      pointsAwarded: w7.points,
      passed: true,
      reason: 'No prior refunds or concessions issued for this order.',
    });
  } else {
    breakdown.push({
      id: w7.id,
      title: w7.title,
      pointsPossible: w7.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'Prior refund or goodwill concession was already issued.',
    });
  }

  const band = getScoreBand(totalScore);
  return {
    totalScore,
    band,
    disputeReason: 'MERCHANDISE_OR_SERVICE_NOT_RECEIVED',
    breakdown,
    summary: `Item Not Received claim assessed at ${totalScore}/100 (${band.toUpperCase()} defense strength).`,
  };
}

function scoreNotAsDescribed(
  dispute: PayPalDispute,
  order?: StoreOrder | null
): ScoreResult {
  const breakdown: RubricItemResult[] = [];
  let totalScore = 0;

  const deliveryEvent = order?.trackingEvents?.find(
    (e) => e.status.toUpperCase() === 'DELIVERED'
  );
  const deliveryTime = deliveryEvent
    ? new Date(deliveryEvent.time).getTime()
    : null;

  // 1. Order listing matches item description (+25)
  const w1 = SNAD_RUBRIC_WEIGHTS.find((w) => w.id === 'SNAD_LISTING_MATCHES')!;
  const hasListingDesc = Boolean(
    order?.listingDescription && order.listingDescription.length > 15
  );
  if (hasListingDesc) {
    totalScore += w1.points;
    breakdown.push({
      id: w1.id,
      title: w1.title,
      pointsPossible: w1.points,
      pointsAwarded: w1.points,
      passed: true,
      reason: 'Detailed item specifications and listing description on record.',
    });
  } else {
    breakdown.push({
      id: w1.id,
      title: w1.title,
      pointsPossible: w1.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'Missing or insufficient listing description in catalog.',
    });
  }

  // 2. Evidence of return policy shown (+15)
  const w2 = SNAD_RUBRIC_WEIGHTS.find((w) => w.id === 'SNAD_RETURN_POLICY')!;
  const hasReturnPolicy = Boolean(
    order?.returnPolicyText && order.returnPolicyText.length > 10
  );
  if (hasReturnPolicy) {
    totalScore += w2.points;
    breakdown.push({
      id: w2.id,
      title: w2.title,
      pointsPossible: w2.points,
      pointsAwarded: w2.points,
      passed: true,
      reason: 'Documented merchant return policy displayed to buyer.',
    });
  } else {
    breakdown.push({
      id: w2.id,
      title: w2.title,
      pointsPossible: w2.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'No documented return policy terms found for this order.',
    });
  }

  // 3. Customer messages show no earlier complaint (+15)
  const w3 = SNAD_RUBRIC_WEIGHTS.find(
    (w) => w.id === 'SNAD_NO_EARLIER_COMPLAINT'
  )!;
  const earlyComplaint = order?.customerMessages?.some((msg) => {
    if (msg.from !== 'customer') return false;
    const msgTime = new Date(msg.time).getTime();
    return deliveryTime ? msgTime < deliveryTime : false;
  });
  if (!earlyComplaint) {
    totalScore += w3.points;
    breakdown.push({
      id: w3.id,
      title: w3.title,
      pointsPossible: w3.points,
      pointsAwarded: w3.points,
      passed: true,
      reason: 'No pre-delivery or premature complaints found in communication log.',
    });
  } else {
    breakdown.push({
      id: w3.id,
      title: w3.title,
      pointsPossible: w3.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'Customer reported dissatisfaction prior to confirmed receipt.',
    });
  }

  // 4. Item photos or description evidence present (+20)
  const w4 = SNAD_RUBRIC_WEIGHTS.find(
    (w) => w.id === 'SNAD_EVIDENCE_PRESENT'
  )!;
  // If listing description has specific condition or photo notes
  const hasEvidence = Boolean(
    order?.listingDescription &&
      (order.listingDescription.toLowerCase().includes('condition') ||
        order.listingDescription.toLowerCase().includes('authentic') ||
        order.listingDescription.toLowerCase().includes('sealed') ||
        order.listingDescription.toLowerCase().includes('photo') ||
        order.listingDescription.length > 50)
  );
  if (hasEvidence) {
    totalScore += w4.points;
    breakdown.push({
      id: w4.id,
      title: w4.title,
      pointsPossible: w4.points,
      pointsAwarded: w4.points,
      passed: true,
      reason: 'High-specificity listing evidence and condition disclosures verified.',
    });
  } else {
    breakdown.push({
      id: w4.id,
      title: w4.title,
      pointsPossible: w4.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'Insufficient item condition and photo documentation.',
    });
  }

  // 5. No prior refund or goodwill offer (+10)
  const w5 = SNAD_RUBRIC_WEIGHTS.find(
    (w) => w.id === 'SNAD_NO_PRIOR_REFUND_OR_OFFER'
  )!;
  const hasPriorRefund = Boolean(order?.refunds && order.refunds.length > 0);
  if (!hasPriorRefund) {
    totalScore += w5.points;
    breakdown.push({
      id: w5.id,
      title: w5.title,
      pointsPossible: w5.points,
      pointsAwarded: w5.points,
      passed: true,
      reason: 'No prior partial refund or goodwill credit has been applied.',
    });
  } else {
    breakdown.push({
      id: w5.id,
      title: w5.title,
      pointsPossible: w5.points,
      pointsAwarded: 0,
      passed: false,
      reason: `Prior refund or settlement exists: ${order?.refunds.map((r) => `$${r.amount}`).join(', ')}`,
    });
  }

  // 6. Delivery confirmed (+15)
  const w6 = SNAD_RUBRIC_WEIGHTS.find(
    (w) => w.id === 'SNAD_DELIVERY_CONFIRMED'
  )!;
  const isDelivered = Boolean(deliveryEvent);
  if (isDelivered) {
    totalScore += w6.points;
    breakdown.push({
      id: w6.id,
      title: w6.title,
      pointsPossible: w6.points,
      pointsAwarded: w6.points,
      passed: true,
      reason: 'Delivery confirmed; buyer is in physical possession of item.',
    });
  } else {
    breakdown.push({
      id: w6.id,
      title: w6.title,
      pointsPossible: w6.points,
      pointsAwarded: 0,
      passed: false,
      reason: 'Item delivery could not be confirmed via carrier tracking.',
    });
  }

  const band = getScoreBand(totalScore);
  return {
    totalScore,
    band,
    disputeReason: 'MERCHANDISE_OR_SERVICE_NOT_AS_DESCRIBED',
    breakdown,
    summary: `Not As Described claim assessed at ${totalScore}/100 (${band.toUpperCase()} defense strength).`,
  };
}
