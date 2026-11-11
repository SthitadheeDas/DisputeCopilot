import { CONFIG } from '../config.js';
import { getPayPalAccessToken } from './auth.js';
import { PayPalDispute } from '../types/dispute.js';

export interface PayPalDisputesListResponse {
  items?: PayPalDispute[];
  disputes?: PayPalDispute[];
  links?: { href: string; rel: string; method: string }[];
  total_items?: number;
}

/**
 * PayPal Disputes API v1 Client
 * Strictly conforms to official PayPal Developer Documentation for v1/customer/disputes.
 * Base URL: https://api-m.sandbox.paypal.com
 */

export async function fetchLiveDisputes(): Promise<PayPalDispute[]> {
  const token = await getPayPalAccessToken();
  const url = `${CONFIG.paypal.baseUrl}/v1/customer/disputes`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Failed to fetch live disputes from PayPal (HTTP ${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as PayPalDisputesListResponse;
  // PayPal Disputes API returns either 'disputes' or 'items' depending on query
  return data.disputes || data.items || [];
}

export async function fetchLiveDisputeDetails(disputeId: string): Promise<PayPalDispute> {
  const token = await getPayPalAccessToken();
  const url = `${CONFIG.paypal.baseUrl}/v1/customer/disputes/${disputeId}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `Failed to fetch dispute ${disputeId} from PayPal (HTTP ${response.status}): ${errorText}`
    );
  }

  return (await response.json()) as PayPalDispute;
}

export interface SubmitEvidenceResult {
  dryRun: boolean;
  success: boolean;
  message: string;
  submittedPayload: Record<string, unknown>;
  response?: Record<string, unknown>;
}

/**
 * Submits evidence to PayPal Disputes API: POST /v1/customer/disputes/{dispute_id}/provide-evidence
 * Requires multipart/form-data with an "input" JSON field.
 * In Sandbox, uses evidence_type "OTHER".
 */
export async function submitPayPalEvidence(
  disputeId: string,
  notes: string
): Promise<SubmitEvidenceResult> {
  const payload = {
    evidences: [
      {
        evidence_type: 'OTHER',
        notes,
      },
    ],
  };

  if (CONFIG.dryRun) {
    return {
      dryRun: true,
      success: true,
      message:
        'DRY_RUN mode active: Evidence payload validated and previewed without sending to PayPal.',
      submittedPayload: payload,
    };
  }

  const token = await getPayPalAccessToken();
  const url = `${CONFIG.paypal.baseUrl}/v1/customer/disputes/${disputeId}/provide-evidence`;

  // Construct multipart/form-data with the required 'input' field
  const formData = new FormData();
  formData.append('input', JSON.stringify(payload));

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Note: fetch will set the boundary header automatically for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `PayPal evidence submission failed (HTTP ${response.status}): ${errorText}`
    );
  }

  const responseData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return {
    dryRun: false,
    success: true,
    message: 'Evidence successfully submitted to PayPal Sandbox.',
    submittedPayload: payload,
    response: responseData,
  };
}

export interface AcceptClaimResult {
  dryRun: boolean;
  success: boolean;
  message: string;
  submittedPayload: Record<string, unknown>;
  response?: Record<string, unknown>;
}

/**
 * Accepts claim: POST /v1/customer/disputes/{dispute_id}/accept-claim
 */
export async function acceptPayPalClaim(
  disputeId: string,
  note = 'Merchant accepted customer claim.'
): Promise<AcceptClaimResult> {
  const payload = { note };

  if (CONFIG.dryRun) {
    return {
      dryRun: true,
      success: true,
      message:
        'DRY_RUN mode active: Accept claim action validated without sending to PayPal.',
      submittedPayload: payload,
    };
  }

  const token = await getPayPalAccessToken();
  const url = `${CONFIG.paypal.baseUrl}/v1/customer/disputes/${disputeId}/accept-claim`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `PayPal accept claim failed (HTTP ${response.status}): ${errorText}`
    );
  }

  const responseData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return {
    dryRun: false,
    success: true,
    message: 'Claim accepted on PayPal Sandbox.',
    submittedPayload: payload,
    response: responseData,
  };
}

export interface MakeOfferResult {
  dryRun: boolean;
  success: boolean;
  message: string;
  submittedPayload: Record<string, unknown>;
  response?: Record<string, unknown>;
}

/**
 * Proposes a partial refund offer: POST /v1/customer/disputes/{dispute_id}/make-offer
 */
export async function makePayPalOffer(
  disputeId: string,
  amount: number,
  note = 'Merchant settlement offer',
  currency = 'USD'
): Promise<MakeOfferResult> {
  const payload = {
    note,
    offer_type: 'REFUND',
    offer_amount: {
      currency_code: currency,
      value: amount.toFixed(2),
    },
  };

  if (CONFIG.dryRun) {
    return {
      dryRun: true,
      success: true,
      message:
        'DRY_RUN mode active: Settlement offer validated without sending to PayPal.',
      submittedPayload: payload,
    };
  }

  const token = await getPayPalAccessToken();
  const url = `${CONFIG.paypal.baseUrl}/v1/customer/disputes/${disputeId}/make-offer`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new Error(
      `PayPal settlement offer failed (HTTP ${response.status}): ${errorText}`
    );
  }

  const responseData = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  return {
    dryRun: false,
    success: true,
    message: 'Settlement offer submitted to customer on PayPal Sandbox.',
    submittedPayload: payload,
    response: responseData,
  };
}
