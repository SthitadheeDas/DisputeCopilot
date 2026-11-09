/**
 * Standardized Date Formatting Utilities for Dispute Copilot
 * Enforces GMT/UTC time representation across all views to align with PayPal Dispute API timestamps.
 */

/**
 * Format any timestamp or Date into official RFC 1123 GMT string (e.g., 'Sun, 08 Nov 2026 18:00:00 GMT')
 * Exactly matches Evidence Pack Facts F4 & F5.
 */
export function formatToGMT(dateInput: string | number | Date): string {
  const d =
    typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;
  if (isNaN(d.getTime())) return '';
  return d.toUTCString();
}

/**
 * Format timestamp into standard UTC date string
 */
export function formatUTCDate(
  dateInput: string | number | Date,
  options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
): string {
  const d =
    typeof dateInput === 'string' || typeof dateInput === 'number'
      ? new Date(dateInput)
      : dateInput;
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    ...options,
    timeZone: 'UTC',
  }).format(d);
}

/**
 * Format countdown label in UTC
 */
export function formatUTCDuration(hoursRemaining: number): string {
  if (hoursRemaining <= 0) return 'Overdue (UTC)';
  const days = Math.floor(hoursRemaining / 24);
  const hours = hoursRemaining % 24;
  if (days > 0) return `${days}d ${hours}h remaining (UTC)`;
  return `${hours}h remaining (UTC)`;
}
