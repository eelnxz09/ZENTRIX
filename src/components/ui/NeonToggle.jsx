import React from 'react';
import { motion } from 'framer-motion';

export const NeonToggle = ({ checked, onChange, label, disabled = false, className = '' }) => {
  return (
    <label className={`flex items-center gap-3 cursor-pointer select-none ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>
      <div
        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
          checked ? 'bg-cyan-400/20 border-cyan-400/50' : 'bg-white/5 border-white/10'
        } border`}
        onClick={disabled ? undefined : () => onChange?.(!checked)}
      >
        <motion.div
          animate={{ x: checked ? 20 : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`absolute top-1 w-4 h-4 rounded-full transition-colors ${
            checked ? 'bg-cyan-400 shadow-[0_0_10px_rgba(0,245,255,0.5)]' : 'bg-slate-500'
          }`}
        />
      </div>
      {label && (
        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{label}</span>
      )}
    </label>
  );
};
