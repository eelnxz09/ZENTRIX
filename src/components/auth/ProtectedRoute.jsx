import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FullPageSpinner } from '../ui/Spinner';

/**
 * ProtectedRoute — Wraps routes that require authentication.
 * - Redirects to /login if not authenticated.
 * - Redirects to /setup if first login (profile incomplete).
 */
export const ProtectedRoute = ({ children }) => {
  const { user, userDoc, loading, isFirstLogin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullPageSpinner text="Authenticating..." />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If profile is not complete and we're not already on the setup page
  if (isFirstLogin && location.pathname !== '/setup') {
    return <Navigate to="/setup" replace />;
  }

  return children;
};
