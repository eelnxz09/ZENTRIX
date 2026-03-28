import { useContext } from 'react';
import { useAuth } from './useAuth';
import { hasPermission, ROLES } from '../utils/permissions';

export function useRole() {
  const { userDoc } = useAuth();

  const can = (permission) => {
    if (!userDoc) return false;
    if (userDoc.role === ROLES.OWNER) return true; // Owner can do everything
    return hasPermission(userDoc.permissions, permission);
  };

  const isOwner = () => userDoc?.role === ROLES.OWNER;
  const isManager = () => userDoc?.role === ROLES.MANAGER;
  const isGameTeamManager = () => userDoc?.role === ROLES.GAME_TEAM_MANAGER;
  const isPlayer = () => userDoc?.role === ROLES.PLAYER;

  // Convenience: Owner OR Manager (both have broad system access)
  const isOwnerOrManager = () => isOwner() || isManager();

  // Can create users of a given role
  const canCreateUsers = () => isOwner() || isManager();
  const canCreateManagers = () => isOwner(); // Only owner creates managers
  const canDeleteFinancials = () => false; // NEVER — Firestore enforces this
  const canViewAuditLogs = () => isOwner(); // Only owner
  const canAmendFinancials = () => isOwner(); // Only owner can amend

  return {
    can,
    isOwner,
    isManager,
    isGameTeamManager,
    isPlayer,
    isOwnerOrManager,
    canCreateUsers,
    canCreateManagers,
    canDeleteFinancials,
    canViewAuditLogs,
    canAmendFinancials,
    role: userDoc?.role,
    permissions: userDoc?.permissions || [],
  };
}
