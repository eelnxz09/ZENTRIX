import React from 'react';

export default function PageHeader({ title, subtitle, badge, children, className = '' }) {
  return (
    <div className={`mb-8 md:mb-10 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          {subtitle && (
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-cyan-400 mb-2 block">
              {subtitle}
            </span>
          )}
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black font-display tracking-tighter text-white uppercase">
              {title}
            </h1>
            {badge}
          </div>
        </div>
        {children && (
          <div className="flex items-center gap-3 shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
