import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

export const DropdownMenu = ({ items = [], trigger, className = '' }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger */}
      {trigger ? (
        <div onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
          {trigger}
        </div>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
          className="p-1.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
        >
          <MoreVertical size={16} />
        </button>
      )}

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1 z-50 min-w-[180px] bg-[#0A0A1A] border border-white/10 rounded-xl shadow-[0_16px_64px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {items.map((item, i) => {
              if (item.divider) {
                return <div key={i} className="h-px bg-white/5 my-1" />;
              }

              if (item.hidden) return null;

              return (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    item.onClick?.();
                  }}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold tracking-widest uppercase transition-colors text-left ${
                    item.danger
                      ? 'text-pink-400 hover:bg-pink-400/5'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  } ${item.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
