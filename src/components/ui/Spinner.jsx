import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-4',
  };

  return (
    <div className={`${sizes[size]} border-cyan-400 border-t-transparent rounded-full animate-spin ${className}`} />
  );
};

export const FullPageSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-space flex flex-col items-center justify-center gap-4">
      <Spinner size="lg" />
      <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-500">{text}</p>
    </div>
  );
};
