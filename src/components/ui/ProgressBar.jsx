import React from 'react';
import { motion } from 'framer-motion';

export const ProgressBar = ({ value = 0, max = 100, color = 'cyan', showLabel = false, size = 'sm', className = '' }) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const colors = {
    cyan: 'bg-cyan-400',
    green: 'bg-green-400',
    pink: 'bg-pink-400',
    purple: 'bg-purple-400',
    gold: 'bg-yellow-500',
  };

  const heights = {
    xs: 'h-0.5',
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-white/10 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`${heights[size]} ${colors[color]} rounded-full`}
        />
      </div>
    </div>
  );
};
