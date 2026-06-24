import React from 'react';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
}

export function Avatar({ src, name, size = 40, className = '' }: AvatarProps) {
  const initials = name ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : 'NV';
  return (
    <div style={{ width: size, height: size }} className={`rounded-full overflow-hidden bg-slate-800 flex items-center justify-center text-sm font-semibold text-white ${className}`}>
      {src ? <img src={src} alt={name} className="h-full w-full object-cover" /> : <span>{initials}</span>}
    </div>
  );
}

export default Avatar;
