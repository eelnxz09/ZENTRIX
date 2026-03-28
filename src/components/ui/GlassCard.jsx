import React from 'react';
import { motion } from 'framer-motion';

export const GlassCard = ({ children, className = '', elevated = false, delay = 0 }) => {
  const baseClass = elevated ? 'elevated-card' : 'glass-card';
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ y: -3, borderColor: 'rgba(0,245,255,0.4)' }}
      className={`${baseClass} rounded-lg p-6 relative overflow-hidden transition-colors ${className}`}
    >
      {children}
    </motion.div>
  );
};
