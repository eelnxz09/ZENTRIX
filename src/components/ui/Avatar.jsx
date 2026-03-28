import React from 'react';

export const Avatar = ({ src, name = 'U', size = 'md', className = '', onClick }) => {
  const sizes = {
    xs: 'w-6 h-6 text-[8px]',
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-14 h-14 text-sm',
    xl: 'w-20 h-20 text-lg',
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0A0A1A&color=00F5FF&size=80`;

  return (
    <div
      className={`${sizes[size]} rounded-full border border-cyan-400/20 overflow-hidden bg-white/5 flex items-center justify-center shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => { e.target.src = fallbackUrl; }}
        />
      ) : (
        <img
          src={fallbackUrl}
          alt={initials}
          className="w-full h-full object-cover rounded-full"
        />
      )}
    </div>
  );
};
