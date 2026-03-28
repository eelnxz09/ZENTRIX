import { useState } from 'react';
import { storage } from '../firebase/config';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Hook for Firebase Storage operations with progress tracking.
 */
export function useStorage() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  /**
   * Upload a file to Firebase Storage
   * @param {File} file - File to upload
   * @param {string} path - Storage path (e.g., 'screenshots/tournament_123.png')
   * @returns {Promise<string>} Download URL
   */
  const upload = async (file, path) => {
    if (!file) throw new Error('No file provided');

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            setProgress(pct);
          },
          (err) => {
            setError(err.message);
            setUploading(false);
            reject(err);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            setProgress(100);
            resolve(url);
          }
        );
      });
    } catch (err) {
      setError(err.message);
      setUploading(false);
      throw err;
    }
  };

  /**
   * Delete a file from Firebase Storage
   * @param {string} path - Storage path to delete
   */
  const remove = async (path) => {
    if (!path) return;
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (err) {
      // If file doesn't exist, that's fine
      if (err.code !== 'storage/object-not-found') {
        console.error('[Zentrix Storage] Delete failed:', err);
        throw err;
      }
    }
  };

  return { upload, remove, uploading, progress, error };
}
