// ═══════════════════════════════════════════════════════════
// ZENTRIX ESPORTS — Firebase Auth Module
// No self-registration. Credential issuance by Owner/Manager only.
// ═══════════════════════════════════════════════════════════

import {
  getAuth,
  onAuthStateChanged as fbOnAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { db } from './config';
import { doc, setDoc } from 'firebase/firestore';
import { ROLES, getDefaultPermissions } from '../utils/permissions';
import app from './config';

const auth = getAuth(app);

// ━━━ SECONDARY APP for creating users without logging out admin ━━━
import { getApp, getApps } from 'firebase/app';

let secondaryApp = null;
let secondaryAuth = null;

function getSecondaryAuth() {
  if (!secondaryAuth) {
    const config = app.options;
    // Prevent "App already exists" crash during Vite HMR
    const existingApps = getApps();
    secondaryApp = existingApps.find(a => a.name === 'zentrix-secondary');
    if (!secondaryApp) {
      secondaryApp = initializeApp(config, 'zentrix-secondary');
    }
    secondaryAuth = getAuth(secondaryApp);
  }
  return secondaryAuth;
}

// ━━━ NON-BLOCKING AUDIT LOG (fire-and-forget) ━━━
function logAudit(data) {
  import('../utils/auditLogger.js').then(({ writeAuditLog }) => {
    writeAuditLog(data).catch(() => {});
  }).catch(() => {});
}

// ━━━ AUTH STATE LISTENER ━━━
export const onAuthStateChange = (callback) => {
  return fbOnAuthStateChanged(auth, callback);
};

// ━━━ LOGIN ━━━
export const loginWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);

  // Fire-and-forget audit — do NOT await
  logAudit({
    action: 'user_login',
    collectionName: 'users',
    docId: result.user.uid,
    data: { email: result.user.email },
    performedBy: result.user.uid,
    performedByName: result.user.displayName || email,
    performedByEmail: result.user.email,
  });

  return result.user;
};

// ━━━ LOGOUT ━━━
export const logoutUser = async () => {
  const currentUser = auth.currentUser;
  if (currentUser) {
    // Fire-and-forget audit — do NOT await
    logAudit({
      action: 'user_logout',
      collectionName: 'users',
      docId: currentUser.uid,
      data: { email: currentUser.email },
      performedBy: currentUser.uid,
      performedByName: currentUser.displayName || 'User',
      performedByEmail: currentUser.email,
    });
  }
  await signOut(auth);
};

// ━━━ CREATE USER ACCOUNT (By Owner/Manager) ━━━
export const createUserAccount = async ({
  email,
  password,
  displayName,
  ign,
  inGameRole,
  role,
  game = null,
  teamId = null,
  createdByUid,
  createdByName,
  createdByEmail,
}) => {
  const secAuth = getSecondaryAuth();
  const userCred = await createUserWithEmailAndPassword(secAuth, email.trim().toLowerCase(), password);
  const uid = userCred.user.uid;

  // Do not block forever on updateProfile
  try {
    await Promise.race([
      updateProfile(userCred.user, { displayName }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Auth update timeout')), 5000))
    ]);
  } catch (err) {
    console.warn('[Zentrix] updateProfile timeout/error:', err.message);
  }

  const permissions = getDefaultPermissions(role);

  const userData = {
    uid,
    email: email.trim().toLowerCase(),
    displayName,
    ign: ign || '',
    role,
    permissions,
    game,
    teamId,
    isActive: true,
    profileComplete: true,
    createdAt: Date.now(),
    createdBy: createdByUid,
    createdByName,
  };

  // Write user doc — use Promise.race to prevent indefinite hangs
  try {
    await Promise.race([
      setDoc(doc(db, 'users', uid), userData),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 8000))
    ]);

    // If this is a PLAYER, also create their stats profile in the 'players' collection
    if (role === ROLES.PLAYER) {
      await Promise.race([
        setDoc(doc(db, 'players', uid), {
          id: uid,
          userId: uid,
          displayName,
          ign: ign || displayName,
          game: game || 'BGMI',
          teamId: teamId || null,
          role: inGameRole || 'Player',
          isActive: true,
          stats: { totalMatches: 0, wins: 0, kills: 0, kd: 0, accuracy: 0, clutchRate: 0 },
          createdAt: Date.now(),
          createdBy: createdByUid,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Firestore timeout')), 8000))
      ]);
    }
  } catch (err) {
    console.warn('[Zentrix] Failed to write user/player doc (timeout/offline), data saved to local cache:', err.message);
  }

  // Sign out from secondary app (cleanup)
  try { await signOut(secAuth); } catch (_) {}

  // Fire-and-forget audit
  logAudit({
    action: 'user_created',
    collectionName: 'users',
    docId: uid,
    data: { email, role, displayName, ign, game, teamId },
    performedBy: createdByUid,
    performedByName: createdByName,
    performedByEmail: createdByEmail,
  });

  return { uid, email, password, displayName, role };
};

// ━━━ SEED OWNER/MANAGER ACCOUNTS ━━━
// Non-blocking — runs in background, errors are swallowed
export const seedSystemAccounts = async () => {
  const SYSTEM_ACCOUNTS = [
    { email: 'sahil@zentrixesports.com', password: 'sahil123', name: 'Sahil', role: ROLES.OWNER },
    { email: 'hrishikesh@zentrixesports.com', password: 'hrishi123', name: 'Hrishikesh', role: ROLES.OWNER },
    { email: 'neel@zentrixesports.com', password: 'neel123', name: 'Neel', role: ROLES.OWNER },
  ];

  for (const account of SYSTEM_ACCOUNTS) {
    try {
      const secAuth = getSecondaryAuth();
      let uid;
      
      try {
        const userCred = await createUserWithEmailAndPassword(secAuth, account.email, account.password);
        uid = userCred.user.uid;
      } catch (err) {
        if (err.code === 'auth/email-already-in-use') {
          // If already exists, we can't easily get the UID here without signing in,
          // which might disrupt the session or require the password.
          // We'll rely on the AuthContext auto-fix for existing users.
          continue;
        }
        throw err;
      }

      await setDoc(doc(db, 'users', uid), {
        uid,
        email: account.email,
        displayName: account.name,
        role: account.role,
        permissions: getDefaultPermissions(account.role),
        isActive: true,
        profileComplete: true,
        createdAt: Date.now(),
        createdBy: 'system',
      });

      try { await signOut(secAuth); } catch (_) {}
      console.log(`[Zentrix] Seeded: ${account.email}`);
    } catch (err) {
      console.warn(`[Zentrix] Seed ${account.email}:`, err.code || err.message);
    }
  }
};

// ━━━ DEPRECATED ━━━
export const registerUser = async () => {
  throw new Error('Direct registration is disabled.');
};
export const loginWithGoogle = async () => {
  throw new Error('Google Auth is disabled.');
};
