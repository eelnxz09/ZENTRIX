// ═══════════════════════════════════════════════════════════
// ZENTRIX ESPORTS — Firestore Module
// Centralized Firestore helpers with audit logging
// ═══════════════════════════════════════════════════════════

import { db } from './config';
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc as fsGetDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';

// ━━━ SINGLE DOCUMENT OPERATIONS ━━━

/**
 * Get a single document by ID
 */
export async function getDocument(collectionPath, docId) {
  if (!docId) return null;
  const docRef = doc(db, collectionPath, docId);
  const docSnap = await fsGetDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() };
  }
  return null;
}

/**
 * Add a new document (auto-generated ID)
 */
export async function addDocument(collectionPath, data) {
  const colRef = collection(db, collectionPath);
  const docRef = await addDoc(colRef, {
    ...data,
    createdAt: Date.now(),
  });
  // Update doc with its own ID
  await updateDoc(docRef, { id: docRef.id });
  return { id: docRef.id, ...data };
}

/**
 * Set a document with a specific ID (creates or overwrites)
 */
export async function setDocument(collectionPath, docId, data) {
  const docRef = doc(db, collectionPath, docId);
  await setDoc(docRef, {
    ...data,
    id: docId,
    updatedAt: Date.now(),
  }, { merge: true });
  return { id: docId, ...data };
}

/**
 * Update specific fields on an existing document
 */
export async function updateDocument(collectionPath, docId, data) {
  if (!docId) throw new Error('Document ID required for update');
  const docRef = doc(db, collectionPath, docId);
  await updateDoc(docRef, {
    ...data,
    updatedAt: Date.now(),
  });
  return { id: docId, ...data };
}

/**
 * Delete a document
 * Note: financial_logs and audit_logs cannot be deleted (Firestore rules enforce this)
 */
export async function removeDocument(collectionPath, docId) {
  if (!docId) throw new Error('Document ID required for delete');

  // Client-side guard for immutable collections
  if (collectionPath === 'financial_logs' || collectionPath === 'audit_logs') {
    throw new Error(`Documents in ${collectionPath} cannot be deleted. Use amendments instead.`);
  }

  const docRef = doc(db, collectionPath, docId);
  await deleteDoc(docRef);
  return { id: docId };
}

// ━━━ FINANCIAL LOG OPERATIONS (Immutable) ━━━

/**
 * Add a financial log entry (immutable — never deleted, never edited)
 */
export async function addFinancialLog(data) {
  return addDocument('financial_logs', {
    ...data,
    version: 1,
    isAmendment: false,
    isAmended: false,
  });
}

/**
 * Amend a financial log (creates a NEW versioned document, marks original as amended)
 */
export async function amendFinancialLog(originalDocId, amendedData, amendedBy) {
  // Get original
  const original = await getDocument('financial_logs', originalDocId);
  if (!original) throw new Error('Original financial log not found');

  // Mark original as amended
  const originalRef = doc(db, 'financial_logs', originalDocId);
  await updateDoc(originalRef, {
    isAmended: true,
    amendedAt: Date.now(),
    amendedBy,
    updatedAt: Date.now(),
  });

  // Create new versioned amendment
  const amendment = await addDocument('financial_logs', {
    ...original,
    ...amendedData,
    id: undefined, // will be auto-set
    version: (original.version || 1) + 1,
    isAmendment: true,
    amendsDocId: originalDocId,
    amendedBy,
    amendedAt: Date.now(),
  });

  return amendment;
}

// ━━━ QUERY HELPERS ━━━

/**
 * Query a collection with filters
 */
export async function queryDocuments(collectionPath, filters = [], orderByField = null, limitCount = null) {
  let q = collection(db, collectionPath);

  if (filters.length > 0) {
    const constraints = filters.map(f => where(f.field, f.operator, f.value));
    q = query(q, ...constraints);
  }

  if (orderByField) {
    q = query(q, orderBy(orderByField, 'desc'));
  }

  if (limitCount) {
    q = query(q, limit(limitCount));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// Re-export Firestore primitives for direct use in hooks
export {
  collection,
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  fsGetDoc as getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
};
