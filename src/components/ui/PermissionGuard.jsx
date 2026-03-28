import React from 'react';
import { useRole } from '../../hooks/useRole';

export const PermissionGuard = ({ permission, children, fallback = null }) => {
  const { can, loading } = useRole();
  
  // If no specific permission needed, just make sure user is logged in
  if (!permission) return <>{children}</>;
  if (can(permission)) return <>{children}</>;
  
  return fallback;
};
