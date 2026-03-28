import { useAuth } from './useAuth';
import { useFirestoreAdd } from './useFirestore';

export function useAuditLog() {
  const { user, userDoc } = useAuth();
  const { add } = useFirestoreAdd('audit_logs');

  const log = async ({ action, collection, docId, data, notes }) => {
    const performedBy = user?.uid || 'system';
    const performedByName = userDoc?.displayName || user?.displayName || 'System';
    const performedByEmail = userDoc?.email || user?.email || '';

    try {
      await add({
        action,
        collection,
        docId: docId || '',
        data: data || {},
        notes: notes || '',
        performedBy,
        performedByName,
        performedByEmail,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('[Zentrix Audit] Hook log failed:', err);
      // Don't throw — audit failures shouldn't crash the app
    }
  };

  return { log };
}
