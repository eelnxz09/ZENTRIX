import React from 'react';
import { motion } from 'framer-motion';

export const NeonButton = ({ children, onClick, className = '', disabled, variant = 'primary', type = 'button' }) => {
  const baseClasses = "px-6 py-3 rounded-xl font-bold text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:shadow-[0_0_30px_rgba(0,245,255,0.6)]",
    secondary: "bg-white/5 border border-cyan-400/30 text-cyan-400 hover:bg-cyan-400/10",
    danger: "bg-gradient-to-r from-pink to-purple text-white shadow-[0_0_20px_rgba(255,45,120,0.3)] hover:shadow-[0_0_30px_rgba(255,45,120,0.6)]"
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-40 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.button>
  );
};
