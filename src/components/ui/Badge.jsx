import React from 'react';

const BADGE_VARIANTS = {
  default: 'bg-white/5 text-slate-400 border-white/10',
  primary: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30',
  success: 'bg-green-400/10 text-green-400 border-green-400/30',
  danger: 'bg-pink-400/10 text-pink-400 border-pink-400/30',
  warning: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  purple: 'bg-purple-400/10 text-purple-400 border-purple-400/30',
  gold: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30',

  // Role badges
  owner: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30',
  manager: 'bg-purple-400/10 text-purple-400 border-purple-400/30',
  game_team_manager: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
  player: 'bg-green-400/10 text-green-400 border-green-400/30',

  // Status badges
  active: 'bg-green-400/10 text-green-400 border-green-400/30',
  inactive: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
  live: 'bg-pink-400/10 text-pink-400 border-pink-400/30',
  upcoming: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30',
  completed: 'bg-green-400/10 text-green-400 border-green-400/30',
  pending: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30',
};

export const Badge = ({ children, variant = 'default', dot = false, pulse = false, className = '' }) => {
  const colors = BADGE_VARIANTS[variant] || BADGE_VARIANTS.default;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded border ${colors} ${className}`}>
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`} />
      )}
      {children}
    </span>
  );
};
