// ═══════════════════════════════════════════════════════════
// ZENTRIX ESPORTS — Firebase Storage Module
// Real Firebase Storage with upload progress
// ═══════════════════════════════════════════════════════════

import { storage } from './config';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Upload a file to Firebase Storage
 * @param {File} file - File blob to upload
 * @param {string} path - Storage path (e.g., 'screenshots/tournament_123.png')
 * @param {function} onProgress - Optional progress callback (0-100)
 * @returns {Promise<string>} Download URL
 */
export async function uploadFile(file, path, onProgress) {
  if (!file) throw new Error('No file provided for upload');

  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        if (onProgress) onProgress(pct);
      },
      (error) => {
        console.error('[Zentrix Storage] Upload failed:', error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Delete a file from Firebase Storage
 * @param {string} path - Storage path to delete
 */
export async function deleteFile(path) {
  if (!path) return;
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (err) {
    if (err.code !== 'storage/object-not-found') {
      console.error('[Zentrix Storage] Delete failed:', err);
      throw err;
    }
  }
}

/**
 * Generate a storage path for different asset types
 */
export function getStoragePath(type, filename) {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');

  switch (type) {
    case 'avatar':
      return `avatars/${timestamp}_${sanitized}`;
    case 'payment_proof':
      return `payment_proofs/${timestamp}_${sanitized}`;
    case 'tournament_proof':
      return `tournament_proofs/${timestamp}_${sanitized}`;
    case 'scrim_proof':
      return `scrim_proofs/${timestamp}_${sanitized}`;
    case 'certificate':
      return `certificates/${timestamp}_${sanitized}`;
    case 'team_logo':
      return `team_logos/${timestamp}_${sanitized}`;
    default:
      return `uploads/${timestamp}_${sanitized}`;
  }
}
