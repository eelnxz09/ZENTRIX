import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFirestoreAdd, useFirestoreUpdate, useFirestoreDelete, useCollection } from '../hooks/useFirestore';
import { useAuditLog } from '../hooks/useAuditLog';

export const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
  const { user, userDoc } = useAuth();
  const { data: allRoles, loading } = useCollection('roles');

  const { add } = useFirestoreAdd('roles');
  const { update } = useFirestoreUpdate('roles');
  const { remove } = useFirestoreDelete('roles');
  const { update: updateUser } = useFirestoreUpdate('users');
  const { log } = useAuditLog();

  const createRole = async ({ name, permissions, color, description }) => {
    const roleRef = await add({
      name, permissions, color, description,
      createdBy: user?.uid || 'system',
      createdAt: Date.now()
    });
    await log({ action: 'role_created', collection: 'roles', docId: roleRef.id, data: { name, permissions } });
    return roleRef;
  };

  const updateRole = async (roleId, data) => {
    await update(roleId, data);
    await log({ action: 'role_updated', collection: 'roles', docId: roleId, data });
  };

  const deleteRole = async (roleId) => {
    await remove(roleId);
    await log({ action: 'role_deleted', collection: 'roles', docId: roleId, data: {} });
  };

  const assignRole = async (uid, roleId, newRoleType, permissions) => {
    await updateUser(uid, {
      customRole: roleId,
      role: newRoleType,
      permissions
    });
    await log({ action: 'role_assigned', collection: 'users', docId: uid, data: { role: newRoleType, customRole: roleId } });
  };

  const value = {
    allRoles,
    loading,
    createRole,
    updateRole,
    deleteRole,
    assignRole
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};
