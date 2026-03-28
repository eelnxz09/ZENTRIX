import React from 'react';
import { motion } from 'framer-motion';

export const GlassButton = ({ children, onClick, className = '', disabled, variant = 'default', type = 'button', size = 'md' }) => {
  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2.5 text-xs',
    lg: 'px-6 py-3 text-sm',
  };

  const variants = {
    default: 'bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20',
    primary: 'bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/20 hover:border-cyan-400/50',
    danger: 'bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 hover:border-pink-500/50',
    success: 'bg-green-400/10 border border-green-400/30 text-green-400 hover:bg-green-400/20 hover:border-green-400/50',
    ghost: 'bg-transparent border-none text-slate-400 hover:text-white hover:bg-white/5',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`rounded-xl font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-2 ${sizes[size]} ${variants[variant]} ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {children}
    </motion.button>
  );
};
