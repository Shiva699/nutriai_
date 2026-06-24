import React from 'react';

interface ProgressRingProps {
  size?: number;
  stroke?: number;
  percentage: number;
  color?: string;
}

export function ProgressRing({ size = 120, stroke = 10, percentage, color = '#06b6d4' }: ProgressRingProps) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size} className="block">
      <defs>
        <linearGradient id="grad" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <g transform={`translate(${size / 2}, ${size / 2})`}>
        <circle r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
        <circle r={radius} fill="none" stroke="url(#grad)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${circumference} ${circumference}`} strokeDashoffset={offset} transform="rotate(-90)" />
        <text x="0" y="4" textAnchor="middle" className="text-sm font-semibold fill-white" style={{ fontSize: 14 }}>{`${percentage}%`}</text>
      </g>
    </svg>
  );
}

export default ProgressRing;
