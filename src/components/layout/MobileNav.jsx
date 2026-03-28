import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Trophy, Users, Swords, MoreHorizontal } from 'lucide-react';
import { useRole } from '../../hooks/useRole';
import { PERMISSIONS } from '../../utils/permissions';

export default function MobileNav() {
  const { can } = useRole();
  const location = useLocation();

  const tabs = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Home' },
    { to: '/players', icon: <Users size={20} />, label: 'Players', perm: PERMISSIONS.VIEW_PLAYERS },
    { to: '/tournaments', icon: <Trophy size={20} />, label: 'Tourneys', perm: PERMISSIONS.VIEW_TOURNAMENTS },
    { to: '/scrims', icon: <Swords size={20} />, label: 'Scrims', perm: PERMISSIONS.VIEW_SCRIMS },
    { to: '/profile', icon: <MoreHorizontal size={20} />, label: 'More' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-slate-950/95 backdrop-blur-2xl border-t border-white/5 z-40 md:hidden">
      <div className="flex items-center justify-around h-full px-2">
        {tabs.map((tab) => {
          if (tab.perm && !can(tab.perm)) return null;

          const isActive = location.pathname.startsWith(tab.to);

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              {tab.icon}
              <span className="text-[8px] font-bold tracking-widest uppercase">{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
