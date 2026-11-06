import { EnrichedDispute, HealthResponse, ActivityLogEntry } from './types';

const API_BASE = '/api';

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Health check failed with status ${res.status}`);
  return res.json();
}

export async function fetchDisputes(): Promise<{
  dataMode: 'sandbox' | 'fixture';
  dryRun: boolean;
  total: number;
  disputes: EnrichedDispute[];
}> {
  const res = await fetch(`${API_BASE}/disputes`);
  if (!res.ok) throw new Error(`Failed to load disputes (${res.status})`);
  return res.json();
}

export async function fetchDispute(id: string): Promise<EnrichedDispute> {
  const res = await fetch(`${API_BASE}/disputes/${id}`);
  if (!res.ok) throw new Error(`Failed to load dispute ${id} (${res.status})`);
  return res.json();
}

export async function submitEvidence(
  id: string,
  notes: string
): Promise<{
  success: boolean;
  dryRun: boolean;
  message: string;
  submittedPayload: Record<string, unknown>;
}> {
  const res = await fetch(`${API_BASE}/disputes/${id}/submit-evidence`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to submit evidence (${res.status})`);
  }
  return res.json();
}

export async function acceptClaim(
  id: string,
  note?: string
): Promise<{ success: boolean; dryRun: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/disputes/${id}/accept`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ note }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to accept claim (${res.status})`);
  }
  return res.json();
}

export async function makeOffer(
  id: string,
  amount: number,
  note?: string
): Promise<{
  success: boolean;
  dryRun: boolean;
  message: string;
  submittedPayload: Record<string, unknown>;
}> {
  const res = await fetch(`${API_BASE}/disputes/${id}/offer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount, note }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Failed to submit offer (${res.status})`);
  }
  return res.json();
}

export async function fetchActivity(): Promise<{
  total: number;
  activity: ActivityLogEntry[];
}> {
  const res = await fetch(`${API_BASE}/activity`);
  if (!res.ok) throw new Error(`Failed to load activity log (${res.status})`);
  return res.json();
}
