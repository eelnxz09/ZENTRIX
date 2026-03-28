// ═══════════════════════════════════════════════════════════
// ZENTRIX ESPORTS — Standalone Audit Logger
// Fire-and-forget — NEVER blocks the calling function
// ═══════════════════════════════════════════════════════════

import { db } from '../firebase/config';
import { collection, addDoc } from 'firebase/firestore';

/**
 * Write an immutable audit log entry to Firestore.
 * This function NEVER throws — all errors are swallowed.
 */
export async function writeAuditLog({
  action,
  collectionName,
  docId,
  data = {},
  notes = '',
  performedBy = 'system',
  performedByName = 'System',
  performedByEmail = '',
}) {
  try {
    // 5-second timeout to prevent hanging
    await Promise.race([
      addDoc(collection(db, 'audit_logs'), {
        action,
        collection: collectionName,
        docId: docId || '',
        data,
        notes,
        performedBy,
        performedByName,
        performedByEmail,
        timestamp: Date.now(),
        createdAt: Date.now(),
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000)),
    ]);
  } catch (err) {
    // Silently fail — audit log failures must NEVER crash the app
    console.warn('[Zentrix Audit] Write skipped:', err.message);
  }
}
