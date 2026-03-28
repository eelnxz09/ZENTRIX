// ═══════════════════════════════════════════════════════════
// ZENTRIX ESPORTS — Formatters
// Currency, date, time, relative time utilities
// ═══════════════════════════════════════════════════════════

/**
 * Format number as Indian Rupee with L/K suffix
 */
export function formatCurrency(n) {
  if (n === null || n === undefined) return '₹0';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(abs % 10000000 === 0 ? 0 : 1)}Cr`;
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(abs % 100000 === 0 ? 0 : 1)}L`;
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(abs % 1000 === 0 ? 0 : 1)}K`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}

/**
 * Format full currency without abbreviation
 */
export function formatCurrencyFull(n) {
  if (n === null || n === undefined) return '₹0';
  return `₹${Math.abs(n).toLocaleString('en-IN')}`;
}

/**
 * Format date in Indian format: 15 Mar 2024
 */
export function formatDate(timestamp) {
  if (!timestamp) return '—';
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Format date short: 15 Mar
 */
export function formatDateShort(timestamp) {
  if (!timestamp) return '—';
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

/**
 * Format time in IST: 10:45 PM
 */
export function formatTime(timestamp) {
  if (!timestamp) return '—';
  const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

/**
 * Format full datetime: 15 Mar 2024, 10:45 PM
 */
export function formatDateTime(timestamp) {
  if (!timestamp) return '—';
  return `${formatDate(timestamp)}, ${formatTime(timestamp)}`;
}

/**
 * Relative time: "2 hours ago", "3 days ago", "Just now"
 */
export function timeAgo(timestamp) {
  if (!timestamp) return '—';
  const now = Date.now();
  const ts = typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diff = now - ts;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${months}mo ago`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str, maxLen = 30) {
  if (!str) return '';
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
}

/**
 * Generate a short ID: ZX-A9K3
 */
export function generateShortId(prefix = 'ZX') {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 4; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${id}`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format action name: 'role_created' → 'Role Created'
 */
export function formatAction(action) {
  if (!action) return '';
  return action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}
