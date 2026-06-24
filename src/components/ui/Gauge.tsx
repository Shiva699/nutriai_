import React from 'react';

interface GaugeProps {
  value: number; // 0-100
  size?: number;
}

export function Gauge({ value, size = 160 }: GaugeProps) {
  const angle = (value / 100) * 180;
  const radius = size / 2 - 10;
  const rad = (angle - 90) * (Math.PI / 180);
  const x = radius * Math.cos(rad) + size / 2;
  const y = radius * Math.sin(rad) + size / 2;

  return (
    <svg width={size} height={size / 2} viewBox={`0 0 ${size} ${size / 2}`}>
      <defs>
        <linearGradient id="g1" x1="0%" x2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <path d={`M10 ${size / 2 - 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 - 10}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="12" strokeLinecap="round" />
      <path d={`M10 ${size / 2 - 10} A ${radius} ${radius} 0 0 1 ${x} ${y}`} fill="none" stroke="url(#g1)" strokeWidth="12" strokeLinecap="round" />
      <circle cx={x} cy={y} r={6} fill="#06b6d4" />
      <text x={size / 2} y={size / 2 - 18} textAnchor="middle" className="fill-white font-semibold" style={{ fontSize: 18 }}>{`${Math.round(value)}`}</text>
    </svg>
  );
}

export default Gauge;
