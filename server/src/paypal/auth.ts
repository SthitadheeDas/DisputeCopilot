import { CONFIG } from '../config.js';

interface TokenCache {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: TokenCache | null = null;

/**
 * Acquires and caches an OAuth 2.0 Bearer access token for the PayPal Sandbox API.
 * Uses client credentials grant (RFC 6749).
 * Secrets are never logged or stored in plain text outputs.
 */
export async function getPayPalAccessToken(forceRefresh = false): Promise<string> {
  const { clientId, clientSecret, baseUrl } = CONFIG.paypal;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing PayPal credentials: PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET must be configured in .env'
    );
  }

  // Return cached token if valid with a 60-second buffer
  const now = Date.now();
  if (!forceRefresh && tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.accessToken;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unable to read error body');
    throw new Error(
      `PayPal OAuth authentication failed (HTTP ${response.status}): ${errorText}`
    );
  }

  const data = (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  tokenCache = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  };

  return tokenCache.accessToken;
}

export function clearTokenCache(): void {
  tokenCache = null;
}
