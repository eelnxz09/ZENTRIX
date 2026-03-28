import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Trophy, Swords, DollarSign,
  Award, BarChart3, Shield, ScrollText, Settings, Plus, X, UsersRound
} from 'lucide-react';
import { useRole } from '../../hooks/useRole';
import { PERMISSIONS } from '../../utils/permissions';

export default function Sidebar({ isOpen, setIsOpen }) {
  const { can, isOwner, isOwnerOrManager } = useRole();

  const links = [
    { to: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/teams', icon: <UsersRound size={20} />, label: 'Teams', perm: PERMISSIONS.VIEW_TEAMS },
    { to: '/players', icon: <Users size={20} />, label: 'Players', perm: PERMISSIONS.VIEW_PLAYERS },
    { to: '/tournaments', icon: <Trophy size={20} />, label: 'Tournaments', perm: PERMISSIONS.VIEW_TOURNAMENTS },
    { to: '/scrims', icon: <Swords size={20} />, label: 'Scrims', perm: PERMISSIONS.VIEW_SCRIMS },
    { to: '/analytics', icon: <BarChart3 size={20} />, label: 'Analytics', perm: PERMISSIONS.VIEW_ANALYTICS },
    { to: '/certificates', icon: <Award size={20} />, label: 'Certificates', perm: PERMISSIONS.VIEW_CERTIFICATES },
    { to: '/financials', icon: <DollarSign size={20} />, label: 'Financials', perm: PERMISSIONS.VIEW_FINANCIALS },
    { to: '/roles', icon: <Shield size={20} />, label: 'Role Manager', perm: PERMISSIONS.MANAGE_ROLES },
    { to: '/audit-logs', icon: <ScrollText size={20} />, label: 'Audit Logs', perm: PERMISSIONS.VIEW_AUDIT_LOGS },
    { to: '/settings', icon: <Settings size={20} />, label: 'Settings', perm: PERMISSIONS.VIEW_SETTINGS },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-[260px] flex flex-col bg-slate-950/90 backdrop-blur-2xl z-50 shadow-[20px_0_50px_rgba(0,245,255,0.05)] border-r border-white/5 py-8 px-4 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between mb-10 px-4">
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-cyan-400 font-display">ZENTRIX</h1>
            <p className="text-[10px] tracking-widest uppercase font-bold text-slate-500 mt-1">Esports Management</p>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          {links.map((link) => {
            // Role-based hiding: if permission required and user doesn't have it, DON'T RENDER
            if (link.perm && !can(link.perm)) return null;

            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${
                    isActive
                      ? 'text-cyan-400 bg-cyan-400/10 border-r-2 border-cyan-400 shadow-[0_0_15px_rgba(0,245,255,0.1)]'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`
                }
              >
                {link.icon}
                <span className="text-xs font-bold tracking-widest uppercase">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Quick Action */}
        {can(PERMISSIONS.ADD_TOURNAMENTS) && (
          <div className="mt-auto pt-4 px-4">
            <NavLink
              onClick={() => setIsOpen(false)}
              to="/tournaments"
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-400 to-purple-500 text-white py-4 rounded-xl font-bold text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 active:scale-95 transition-all"
            >
              <Plus size={16} /> New Tournament
            </NavLink>
          </div>
        )}
      </aside>
    </>
  );
}
