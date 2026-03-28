import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRole } from '../hooks/useRole';
import OwnerDashboard from './OwnerDashboard';
import ManagerDashboard from './ManagerDashboard';
import PlayerDashboard from './PlayerDashboard';

export default function Dashboard() {
  const { userDoc } = useAuth();
  const { isOwner, isManager, isGameTeamManager, isPlayer } = useRole();

  // Wait for userDoc to fully resolve before rendering — prevents Player Dashboard flash
  if (!userDoc || !userDoc.role) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Priority: Owner → Manager → GameTeamManager → Player
  if (isOwner()) return <OwnerDashboard />;
  if (isManager()) return <ManagerDashboard />;
  // Game Team Manager gets the Manager dashboard with filtered view
  if (isGameTeamManager()) return <ManagerDashboard />;
  if (isPlayer()) return <PlayerDashboard />;

  // Fallback
  return <PlayerDashboard />;
}
