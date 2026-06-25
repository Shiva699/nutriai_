import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded-[20px] border border-white/10 bg-white/5 p-4 shadow-[0_20px_50px_-20px_rgba(2,6,23,0.7)] backdrop-blur-md ${className}`}>
      {children}
    </div>
  );
}

export default Card;
