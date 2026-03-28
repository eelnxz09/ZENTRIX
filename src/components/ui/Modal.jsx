import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, subtitle, children, size = 'md', className = '' }) => {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`relative w-full ${sizes[size]} bg-[#0A0A1A] border border-white/10 rounded-2xl shadow-[0_32px_128px_rgba(0,0,0,0.8)] overflow-hidden ${className}`}
          >
            {/* Header */}
            {(title || subtitle) && (
              <div className="flex items-start justify-between p-6 border-b border-white/5">
                <div>
                  {title && (
                    <h2 className="text-lg font-black font-display tracking-widest text-white uppercase">{title}</h2>
                  )}
                  {subtitle && (
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{subtitle}</p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors -mt-1 -mr-1"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
