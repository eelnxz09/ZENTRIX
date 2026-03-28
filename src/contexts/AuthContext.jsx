import React, { createContext, useState, useEffect, useRef } from 'react';
import { onAuthStateChange, loginWithEmail, logoutUser, seedSystemAccounts } from '../firebase/auth';
import { db } from '../firebase/config';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { ROLES, OWNER_EMAILS, MANAGER_EMAILS, SYSTEM_EMAILS, getDefaultPermissions } from '../utils/permissions';

export const AuthContext = createContext();

// Seed system accounts once on app load — non-blocking
let seeded = false;
function ensureSeeded() {
  if (seeded) return;
  seeded = true;
  seedSystemAccounts().catch(err => {
    console.warn('[Zentrix] Seed:', err.message);
  });
}

/**
 * Determine the hardcoded role for a system email.
 */
function getSystemOverrides(email) {
  const emailLower = email?.toLowerCase();
  if (!emailLower) return null;

  if (OWNER_EMAILS.includes(emailLower)) {
    return {
      role: ROLES.OWNER,
      permissions: getDefaultPermissions(ROLES.OWNER),
      profileComplete: true,
    };
  }
  if (MANAGER_EMAILS.includes(emailLower)) {
    return {
      role: ROLES.MANAGER,
      permissions: getDefaultPermissions(ROLES.MANAGER),
      profileComplete: true,
    };
  }
  return null;
}

/**
 * getDoc with a timeout — never hangs when Firestore is offline.
 */
async function getDocWithTimeout(docRef, timeoutMs = 4000) {
  return Promise.race([
    getDoc(docRef),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Firestore getDoc timeout')), timeoutMs)
    ),
  ]);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialLoadDone = useRef(false);

  // Seed on mount
  useEffect(() => { ensureSeeded(); }, []);

  // Safety timeout: never stay loading for more than 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!initialLoadDone.current) {
        console.warn('[Zentrix Auth] Safety timeout — forcing load complete');
        initialLoadDone.current = true;
        setLoading(false);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const emailLower = firebaseUser.email?.toLowerCase();
        const overrides = getSystemOverrides(emailLower);
        const isSystemAccount = !!overrides;

        // Try to get Firestore doc with timeout
        let docData = null;
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDocWithTimeout(docRef, 4000);
          if (docSnap.exists()) {
            docData = { id: docSnap.id, ...docSnap.data() };
          }
        } catch (err) {
          console.warn('[Zentrix Auth] Firestore fetch failed:', err.message);
        }

        let finalUserDoc;

        if (docData) {
          finalUserDoc = { ...docData };
          if (overrides) {
            finalUserDoc.role = overrides.role;
            finalUserDoc.permissions = overrides.permissions;
            finalUserDoc.profileComplete = true;
          }
        } else {
          let role = ROLES.PLAYER;
          if (overrides) role = overrides.role;

          finalUserDoc = {
            uid: firebaseUser.uid,
            role,
            permissions: getDefaultPermissions(role),
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            email: firebaseUser.email,
            profileComplete: isSystemAccount ? true : false,
          };
        }

        setUserDoc(finalUserDoc);

        // AUTO-FIX: If this is a system account and the DB role is wrong or missing,
        // use the current user session to update the Firestore document.
        // This works because the rule allows 'update: if request.auth.uid == userId'.
        if (overrides && (!docData || docData.role !== overrides.role)) {
          console.info(`[Zentrix Auth] Synchronizing system role for ${firebaseUser.email}...`);
          const docRef = doc(db, 'users', firebaseUser.uid);
          updateDoc(docRef, {
            role: overrides.role,
            permissions: overrides.permissions,
            profileComplete: true,
            updatedAt: Date.now()
          }).catch(err => {
            // If updateDoc fails (maybe doc doesn't exist), try setDoc
            if (err.code === 'not-found' || !docData) {
              setDoc(docRef, finalUserDoc).catch(() => {});
            }
          });
        }
      } else {
        setUser(null);
        setUserDoc(null);
      }

      // Mark initial load complete
      initialLoadDone.current = true;
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Real-time sync user doc changes (after initial load)
  useEffect(() => {
    if (!user?.uid) return;

    const docRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        const overrides = getSystemOverrides(user.email);
        if (overrides) {
          data.role = overrides.role;
          data.permissions = overrides.permissions;
          data.profileComplete = true;
        }
        setUserDoc(data);
      }
    }, (err) => {
      console.warn('[Zentrix Auth] Snapshot error:', err.message);
    });

    return () => unsubscribe();
  }, [user?.uid, user?.email]);

  const isSystemAccount = user?.email && SYSTEM_EMAILS.includes(user.email.toLowerCase());
  const isFirstLogin = !isSystemAccount && userDoc && userDoc.profileComplete === false;

  const value = {
    user,
    userDoc,
    loading,
    login: loginWithEmail,
    logout: logoutUser,
    isFirstLogin,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
