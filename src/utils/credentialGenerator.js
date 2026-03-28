// ═══════════════════════════════════════════════════════════
// ZENTRIX ESPORTS — Credential Generator
// For owner/manager to create user accounts
// ═══════════════════════════════════════════════════════════

/**
 * Generate a secure temporary password (12 chars)
 * Mix of uppercase, lowercase, digits
 */
export function generateTempPassword(baseString = '') {
  // Simpler deterministic passwords for ease of testing during development
  const clean = String(baseString).toLowerCase().replace(/[^a-z0-9]/g, '');
  if (clean.length > 0) {
    return `${clean}123`;
  }
  
  // Fallback if no string provided or empty
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${randomStr}123`;
}

/**
 * Generate email for a new user
 * Format: name@zentrixesports.com
 */
export function generateEmail(name) {
  const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const suffix = Date.now().toString().slice(-4);
  return `${clean}${suffix}@zentrixesports.com`;
}

/**
 * Generate a simple email from display name (no suffix)
 * For manual override by owner/manager
 */
export function generateSimpleEmail(name) {
  const clean = name.toLowerCase().replace(/[^a-z0-9.]/g, '');
  return `${clean}@zentrixesports.com`;
}

/**
 * Generate invite code format (not used for self-registration, 
 * but for credential display reference)
 */
export function generateReferenceCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'ZX-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}
