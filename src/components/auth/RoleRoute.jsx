import React from 'react';
import { useRole } from '../../hooks/useRole';
import { Navigate } from 'react-router-dom';

/**
 * RoleRoute — Renders children ONLY if user has the required role or permission.
 * If unauthorized: renders nothing (completely absent from DOM), or redirects.
 *
 * Usage:
 *   <RoleRoute roles={['owner']} permission="view_audit_logs">
 *     <AuditLogs />
 *   </RoleRoute>
 */
export const RoleRoute = ({ children, roles = [], permission, redirect = false }) => {
  const { role, can } = useRole();

  let authorized = false;

  // Check role-based access
  if (roles.length > 0 && roles.includes(role)) {
    authorized = true;
  }

  // Check permission-based access
  if (permission && can(permission)) {
    authorized = true;
  }

  // If no roles or permissions specified, allow all authenticated users
  if (roles.length === 0 && !permission) {
    authorized = true;
  }

  if (!authorized) {
    if (redirect) {
      return <Navigate to="/dashboard" replace />;
    }
    return null; // Completely absent from DOM per spec
  }

  return children;
};
